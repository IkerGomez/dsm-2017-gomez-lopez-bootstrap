// 'ident' and 'secret' should ideally be passed server-side for security purposes.
// If secureTokenRetrieval is true then you should remove these two values.

// Insecure method
var xirsysConnect = {
	secureTokenRetrieval : false,
	data : {
		channel : 'channel1',
		ident : 'markogalarza',
		secret : '336a697a-eef7-11e6-a4ef-1394ae5277b9'
	}
};
/*
var xirsysConnect = {
	secureTokenRetrieval : false,
	data : {
		domain : 'dsm2017',
		application : 'default',
		room : 'default',
		ident : 'markogalarza',
		secret : '8ef83a62-eb17-11e6-bee9-09d9990f7fd5',
		secure : 0
	}
};*/

// Secure method
/*var xirsysConnect = {
	secureTokenRetrieval : true,
	server : '../getToken.php',
	data : {
		domain : '< www.yourdomain.com >',
		application : 'default',
		room : 'default',
		secure : 1
	}
};*/

