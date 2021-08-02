module.exports = {

	discord: {
		status: '%clientUserDisplayName%\'s account.', // The status of the Discord client.
		statusType: 'WATCHING', // The type of the Discord status.
		token: 'TOKEN', // Discord token.
		prefix: '!', // Discord prefix.
		ownerIDs: ['OWNER_ID'], // The people that can use your bot.
		ownerOnly: true // Recommended.
	},

	fortnite: {
		cid: 'CID_028_Athena_Commando_F', // Default skin.
		bid: 'BID_004_BlackKnight', // Default backpack.
		eid:'EID_Floss', // Default emote.
		pickaxe_id: 'Pickaxe_LockJaw', // Default pickaxe.
		
		status: 'Hey!', // Custom status.
		platform: 'WIN', // Platform.

		acceptFriend: true, // Toggle friend requests.
		acceptInvite: true, // Toggle party invites.
		joinMessage: '', // Message to send if someone joins.
	}
}
