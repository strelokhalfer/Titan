from titanembeds.database import db, Guilds, KeyValueProperties, get_keyvalproperty
from flask import request, session
from flask_limiter import Limiter
from config import config
import random
import string
import hashlib
import time

from titanembeds.discordrest import DiscordREST

discord_api = DiscordREST(config['bot-token'])

def get_client_ipaddr():
    if "X-Real-IP" in request.headers: # pythonanywhere specific
        ip = request.headers['X-Real-IP']
    else: # general
        ip = request.remote_addr
    return hashlib.sha512(config['app-secret'] + ip).hexdigest()[:15]

def generate_session_key():
    sess = session.get("sessionunique", None)
    if not sess:
        rand_str = lambda n: ''.join([random.choice(string.lowercase) for i in xrange(n)])
        session['sessionunique'] = rand_str(25)
        sess = session['sessionunique']
    return sess #Totally unique

def make_cache_key(*args, **kwargs):
    path = request.path
    args = str(hash(frozenset(request.args.items())))
    ip = get_client_ipaddr()
    sess = generate_session_key()
    return (path + args + sess + ip).encode('utf-8')

def make_user_cache_key(*args, **kwargs):
    ip = get_client_ipaddr()
    sess = generate_session_key()
    return (sess + ip).encode('utf-8')

def make_guilds_cache_key():
    sess = generate_session_key()
    ip = get_client_ipaddr()
    return (sess + ip + "user_guilds").encode('utf-8')

def make_guildchannels_cache_key():
    guild_id = request.values.get('guild_id', "0")
    sess = generate_session_key()
    ip = get_client_ipaddr()
    return (sess + ip + guild_id + "user_guild_channels").encode('utf-8')

def channel_ratelimit_key(): # Generate a bucket with given channel & unique session key
    sess = generate_session_key()
    channel_id = request.values.get('channel_id', "0")
    return (sess + channel_id).encode('utf-8')

def guild_ratelimit_key():
    ip = get_client_ipaddr()
    guild_id = request.values.get('guild_id', "0")
    return (ip + guild_id).encode('utf-8')

def check_guild_existance(guild_id):
    dbGuild = Guilds.query.filter_by(guild_id=guild_id).first()
    if not dbGuild:
        return False
    else:
        return True

def guild_accepts_visitors(guild_id):
    dbGuild = Guilds.query.filter_by(guild_id=guild_id).first()
    return dbGuild.visitor_view

def guild_query_unauth_users_bool(guild_id):
    dbGuild = db.session.query(Guilds).filter(Guilds.guild_id==guild_id).first()
    return dbGuild.unauth_users
    
def bot_alive():
    results = {"status": False, "formatted_utc": "Never", "epoch_seconds": None}
    epoch = get_keyvalproperty("bot_heartbeat")
    if not epoch:
        return results
    epoch = float(epoch)
    utc = time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime(epoch))
    results["formatted_utc"] = utc
    results["epoch_seconds"] = epoch
    now = time.time()
    if now - epoch < 60 * 5:
        results["status"] = True
    return results

rate_limiter = Limiter(key_func=get_client_ipaddr) # Default limit by ip address
