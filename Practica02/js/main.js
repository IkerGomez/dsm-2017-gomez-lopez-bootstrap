jQuery(document).ready(function($){
	var tabs = $('.cd-tabs');
	
	tabs.each(function(){
		var tab = $(this),
			tabItems = tab.find('ul.cd-tabs-navigation'),
			tabContentWrapper = tab.children('ul.cd-tabs-content'),
			tabNavigation = tab.find('nav');

		tabItems.on('click', 'a', function(event){
			event.preventDefault();
			var selectedItem = $(this);

            var selectedTab = selectedItem.data('content'),
                selectedContent = tabContentWrapper.find('li[data-content="'+selectedTab+'"]'),
                slectedContentHeight = selectedContent.innerHeight();

			if( !selectedItem.hasClass('selected') ) {

				tabItems.find('a.selected').removeClass('selected');
				selectedItem.addClass('selected');
				selectedContent.addClass('selected').siblings('li').removeClass('selected');

			}

			//Change 'Imágenes' and 'Descripción' tab contents
            var pictures = tab.find('ul.cd-tabs-content').find('li[data-content="gallery"]').find('.pictures');
            var descriptions = tab.find('ul.cd-tabs-content').find('li[data-content="info"]').find('.description');
            var buy = tab.find('ul.cd-tabs-content').find('li[data-content="store"]').find('.buy');
            pictures.hide();
            descriptions.hide();
            buy.hide();
            var availableModels = $('.mainPicture');
            var i = 0;
            availableModels.each(function() {
                var model = $(this);
                if(model.hasClass('selected'))
                {
                    pictures.eq(i).show();
                    descriptions.eq(i).show();
                    buy.eq(i).show();
                }
                i++;
            });

            //animate tabContentWrapper height when content changes
            tabContentWrapper.animate({
                'height': slectedContentHeight
            }, 200);
		});

		//hide the .cd-tabs::after element when tabbed navigation has scrolled to the end (mobile version)
		checkScrolling(tabNavigation);
		tabNavigation.on('scroll', function(){ 
			checkScrolling($(this));
		});
	});
	
	$(window).on('resize', function(){
		tabs.each(function(){
			var tab = $(this);
			checkScrolling(tab.find('nav'));
			tab.find('.cd-tabs-content').css('height', 'auto');
		});
	});

	function checkScrolling(tabs){
		var totalTabWidth = parseInt(tabs.children('.cd-tabs-navigation').width()),
		 	tabsViewport = parseInt(tabs.width());
		if( tabs.scrollLeft() >= totalTabWidth - tabsViewport) {
			tabs.parent('.cd-tabs').addClass('is-ended');
		} else {
			tabs.parent('.cd-tabs').removeClass('is-ended');
		}
	}
});