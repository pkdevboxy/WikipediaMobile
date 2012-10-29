window.appSettings = function() {
	var fontSizes = [];	
	var locales = [];
	var themes = [];

	function showSettings(callback) {
		chrome.showSpinner();
		var requestUrl = ROOT_URL + "sitematrix.json";

		if(fontSizes.length == 0) {
			fontSizes = [
				{ value: '100%' },
				{ value: '150%' },
				{ value: '200%' },
				{ value: '300%' }
			];
		}

		if( themes.length === 0 ) {
			themes = [
				{ name: 'light', displayName: 'Light', fileName: 'themes/light.less.css' },
				{ name: 'solarized-dark', displayName: 'Solarized Dark', fileName: 'themes/solarized-dark.less.css' }
			];
		}

		if(locales.length === 0) {
			app.getWikiMetadata().done(function(wikis) { 
				$.each(wikis, function(lang, wikiData) {
					var locale = {
						code: lang,
						name: wikiData.name
					};
					if(wikiData.name !== wikiData.localName) {
						locale.localName = wikiData.localName;
					}
					locales.push(locale);
				});
				locales.sort(function(l1, l2) {
					return l1.name.localeCompare(l2.name);
				});
				renderSettings();
				chrome.hideSpinner();
			});
		} else {
			renderSettings();
			chrome.hideSpinner();
		}
	}

	function renderSettings() {
		var template = templates.getTemplate('settings-page-template');
		$("#settingsList").html( template.render( {
			languages: locales,
			fontSizes: fontSizes,
			themes: themes,
			aboutPage: aboutPage
		} ) );

		var currentContentLanguage = preferencesDB.get("language");
		$("#contentLanguageSelector").val(currentContentLanguage).change(onContentLanguageChanged);

		/* Look up the human readable form of the languagecode */
		$.each(locales, function(index, value) {
			if( value.code == currentContentLanguage) {
				currentContentLanguage = value.name;
				return;
			}
		});
		$("#fontSizeSelector").val(preferencesDB.get("fontSize")).change(onFontSizeChanged);
		$( "#themeSelector" ).val( preferencesDB.get( "theme" ) ).change( onThemeChanged );
		$("#aboutPageLabel").click(function () {
			aboutPage();
		});
		$(".externallink").click(function() {
			var link = $(this).attr('data-link');
			var url = app.baseURL + link;
			chrome.openExternalLink(url);
			return false;
		});
		chrome.hideOverlays();
		chrome.hideContent();
		$('#settings').localize().show();
		// WTFL: The following line of code is necessary to make the 'back' button
		// work consistently on iOS. According to warnings by brion in index.html, 
		// doing this line will break things in Android. Need to test before merge.
		// Also, I've no clue why this fixes the back button not working, but it does
		chrome.setupScrolling("#settings");
	}

	function onContentLanguageChanged() {
		var selectedLanguage = $(this).val();
		app.setContentLanguage(selectedLanguage);
		app.loadMainPage();
	}

	function onFontSizeChanged() {
		var selectedFontSize = $(this).val();
		app.setFontSize(selectedFontSize);
		chrome.showContent();
	}

	function onThemeChanged() {
		var selectedTheme = $( this ).val();
		app.setTheme( selectedTheme );
		chrome.showContent();
	}

	return {
		showSettings: showSettings
	};
}();
