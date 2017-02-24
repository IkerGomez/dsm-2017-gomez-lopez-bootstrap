// 'ident' and 'secret' should ideally be passed server-side for security purposes.
// If secureTokenRetrieval is true then you should remove these two values.

// Insecure method
var xirsysConnect = {
	secureTokenRetrieval : false,
	data : {
		channel : 'default',
		ident : 'cmartinezdemorentin',
		secret : '1d9198ec-fa7a-11e6-b3ff-8ea033d8fb4d'
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
