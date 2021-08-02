const Discord = require('discord.js');
const fetch = require('node-fetch');
const config = require('./config');
const { keep_alive } = require("./keep_alive");
const { Collection } = require('discord.js');
const { Client, Enums } = require('fnbr');
const { readFile, writeFile } = require('fs').promises;

async function getCosmetic(name, backend) {
  const url = 'https://fortnite-api.com/v2/cosmetics/br/search' +
  `?name=${name}` +
  `&backendType=${backend}` +
  `&matchMethod=contains`;

  return (await fetch(url)).json();
}

(async () => {
  const Options = {
    status: config.fortnite.status,
    platform: config.fortnite.platform,
    keepAliveInterval: 30,
    debug: false,
    kairos: {
      cid: config.fortnite.cid[0] ? config.fortnite.cid[0] : config.fortnite.cid,
      color: Enums.KairosColor.GRAY
    },
    auth: {}
  }

  const client = new Discord.Client();

  client.commands = new Collection();
  client.aliases = new Collection();

  ['command'].forEach(handler => {
    require(`./${handler}`)(client);
  });

  try {
    Options.auth.deviceAuth = JSON.parse(await readFile('./deviceAuth.json'));
  } catch (e) {
    Options.auth.authorizationCode = async () => Client.consoleQuestion('[SIRIUS] [FORTNITE] Please enter an authorization code: ');
  }

  const bot = new Client(Options);

  client.on('message', async message => {
    if (!message.content.startsWith(config.discord.prefix)) return;

    if (config.discord.ownerOnly && !config.discord.ownerIDs.includes(message.author.id)) return;

    const args = message.content.slice(config.discord.prefix.length).trim().split(' ');
    const cmd = args.shift().toLowerCase();

    if (cmd.length === 0) return;

    let command = client.commands.get(cmd);
    if (!command) command = client.commands.get(client.aliases.get(cmd));

    if (command) {
      if (!bot.party) return message.channel.send('I am not in a party, please wait!');
      command.run(client, bot, message, args, getCosmetic);
    }
  });

  if (config.discord.token === 'TOKEN') return console.log('[SIRIUS] [DISCORD]', 'Please enter a valid token in config.js');

  bot.on('deviceauth:created', (da) => writeFile('./deviceAuth.json', JSON.stringify(da, null, 2)));

  bot.on('party:member:joined', member => {
    if (member.displayName === bot.user.displayName) return;
    console.log('[SIRIUS] [FORTNITE]', `${member.displayName} has joined the party. New member count: ${bot.party.members.size}.`);
    if (!config.fortnite.joinMessage || config.fortnite.joinMessage === '') return;
    const msg = config.fortnite.joinMessage.replace('%memberName%', member.displayName).replace('%memberCount%', bot.party.members.size);
    bot.party.sendMessage(msg);
  });

  bot.on('party:invite', invite => {
    console.log('[SIRIUS] [FORTNITE]', `Received a party invite from ${invite.sender.displayName}.`);

    if (config.fortnite.acceptInvite) {
      invite.accept();
    } else {
      invite.decline();
    }

    console.log('[SIRIUS] [FORTNITE]', `Invite from ${invite.sender.displayName} has been ${config.fortnite.acceptInvite ? 'accepted' : 'declined'}.`);
  });

  bot.on('friend:request', request => {
    console.log('[SIRIUS] [FORTNITE]', `Received a friend request from ${request.displayName}.`);

    if (config.fortnite.acceptFriend) {
      request.accept();
    } else {
      request.abort();
    }

    console.log('[SIRIUS] [FORTNITE]', `Friend request from ${request.displayName} has been ${config.fortnite.acceptFriend ? 'accepted' : 'declined'}.`);
  });

  bot.on('ready', () => {
    const cosmetics = {
      cid: config.fortnite.cid,
      bid: config.fortnite.bid,
      eid: config.fortnite.eid,
      pickaxe_id: config.fortnite.pickaxe_id
    };

    bot.party.me.setOutfit(cosmetics.cid);
    bot.party.me.setBackpack(cosmetics.bid);
    bot.party.me.setEmote(cosmetics.eid);
    bot.party.me.setPickaxe(cosmetics.pickaxe_id);
  });

  await bot.login();
  client.login(config.discord.token);

  client.on('ready', () => {
    const replaced = config.discord.status.replace('%clientUserDisplayName%', bot.user.displayName).replace('%PartyMemberCount%', bot.party.members.size).replace('%ClientPartyUserOutfit%', bot.party.me.outfit)
    .replace('%ClientPartyUserPickaxe%', bot.party.me.pickaxe).replace('%ClientPartyUserEmote%', bot.party.me.emote).replace('%ClientPartyUserBackpack%', bot.party.me.backpack)
    .replace('%ClientPartyUserIsReady%', bot.party.me.isReady).replace('%ClientPartyUserIsLeader%', bot.party.me.isLeader).replace('%ClientUserID%', bot.id);

    client.user.setActivity(replaced, { type: config.discord.statusType });

    console.log('[SIRIUS] [DISCORD]', `Client ready as ${client.user.tag} [${client.commands.size} commands]`);
    console.log('[SIRIUS] [FORTNITE]', `Client ready as ${bot.user.displayName}.`);
  });
})();
