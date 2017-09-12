if($('#monkey-captcha').length){

	var anchors = $('#monkey-captcha a img'),
		textToSelect = $('#text-to-select'),
		textOption = ''
		contOpt = anchors.length - 1,
		min = 0,
		max = contOpt,
		option = 0,
		//vector whit the images name 
		vImages = [],
		vNamesImg = [];

	// the random number is generated betwen the options
	function randomNumber () {
		var random = Math.floor(Math.random() * (max - min + 1)) + min;
		console.log(random);
		return random;
	};

	//selects an option available in the html to test the user
	function selectOption () { 
		option = randomNumber();
		textOption = anchors[option].alt;
	};

	function changeText (text) {
		textToSelect.text(text);
	};

	//gets an array and change the order in a aleatory way
	function randomOrder (array) {
		var currentIndex = array.length, temporaryValue, randomIndex;

		// While there remain elements to shuffle...
		while (0 !== currentIndex) {
			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			// And swap it with the current element.
			// temporaryValue = array[currentIndex];
			// array[currentIndex] = array[randomIndex];
			// array[randomIndex] = temporaryValue;


			temporaryValue = vImages[currentIndex];
			vImages[currentIndex] = vImages[randomIndex];
			vImages[randomIndex] = temporaryValue;

			temporaryValue = vNamesImg[currentIndex];
			vNamesImg[currentIndex] = vNamesImg[randomIndex];
			vNamesImg[randomIndex] = temporaryValue;

		}

		return array;
	};

	function chargeVecImages () {

		$.each( $('#monkey-captcha a img'), function( index , array ) {
			vImages[index] = $(this).attr('src');
			vNamesImg[index] = $(this).attr('alt'); 
		});
	};

	function changeHtml () {
		$.each( $('#monkey-captcha a img'), function( index , array ) {
			$(this).attr('src', vImages[index]);
			$(this).attr('alt', vNamesImg[index]);
		});
	};


	function init () {
		selectOption();
		changeText(textOption);
		chargeVecImages();
		randomOrder(vImages);
		changeHtml();
	};

	init();

	$('#monkey-captcha a').on('click', function() {
		if ( $(this).find('img').attr('alt') === textToSelect.text() ) {
			$('#monkey-captcha').attr('answer', true );
		}
	});

	$('#btn-refresh').on('click', function (e) {
		e.preventDefault();
		init();
	});
}