/* ******************************************************* */
/* Mainfunctions                                           */
/* ******************************************************* */

/* ------------------------------------------------------- */
/* Onload-Function                                         */
/* ------------------------------------------------------- */

function onPageLoad()
{
	// reconfigure jquery for local json suppport

	$.ajaxSetup( { scriptCharset: 'utf-8' , contentType: 'application/json; charset=utf-8' } );

	// remover context menu und text markings

	disableHtmlStandardBehavior();

	// detect if used on mobile device

	if ( isMobileDevice() )
	{
		$( 'html' ).addClass( 'mobile' )
	}

	// show Loader

	showLoader();

	// set localLanguage

	globalSettings.useLocalStorageLanguage && language.setLanguage( getCurrentLanguageFromLocalStorage() );

	// set load message

	$( '#load_message' ).html( language.getString( 'load_message' ) );

	// preloading

	window.setTimeout( 'preloadRequiredScripts();', 0 );

}

/* ------------------------------------------------------- */
/* Global - Event Handling                                 */
/* ------------------------------------------------------- */

function disableHtmlStandardBehavior()
{
	// disable right clicks

	if ( document.layers )
	{
		document.captureEvents( Event.MOUSEDOWN );
	}

	document.onmousedown   = disableRightClick;
	document.oncontextmenu = new Function('return false');

	// disable all text marks

	$( ':not(input,select,textarea)' ).attr( 'unselectable', 'on' ).addClass( 'unselectable' );
}

function cancelEvents( event )
{
	if ( window.event )
	{
		window.event.cancelBubble = true;
	}

	if ( event.preventDefault )
	{
		event.preventDefault();
	}

	if ( event.stopImmediatePropagation )
	{
		event.stopImmediatePropagation();
	}

	if ( event.stopPropagation )
	{
		event.stopPropagation();
	}

	if ( event.stop )
	{
		event.stop();
	}

	event.returnValue = false;

	return ( false );
}

function disableRightClick( newEvent )
{
	if ( document.all )
	{
		if ( event.button == 2 )
		{
			return false;
		}
	}

	if ( document.layers )
	{
		if ( newEvent.which == 3 )
		{
			return false;
		}
	}
}

/* ------------------------------------------------------- */
/* loader                                                  */
/* ------------------------------------------------------- */

function showLoader()
{
	// hide page

	$( '#page' ).hide();

	// show loader

	$( '#loader' ).show();
}

function hideLoader()
{
	// hide loader

	$( '#loader' ).hide();

	// show page

	$( '#page' ).show();
}

function showSearchLoader()
{
	// show loader

	$( '#search_loader' ).show();
}

function hideSearchLoader()
{
	// hide loader

	$( '#search_loader' ).hide();
}

/* ------------------------------------------------------- */
/* Preloading                                              */
/* ------------------------------------------------------- */

function preloadRequiredScripts()
{
	// first we start with the language depentent scripts

	preloadLanguageDepententScripts();
}

function preloadLanguageDepententScripts()
{
	var scriptsToPreload = [];

	// first we add the configured Know How! AG applications

	for ( var counter = 0; counter < globalSettings.availableLanguages.length; counter++ )
	{
		scriptsToPreload.push( { 'scriptId' : globalSettings.availableLanguages[counter] + '_applications' , 'scriptSource' : 'data/' + globalSettings.availableLanguages[counter] + '_applications.js' } );
	}

	// then we load the added applications and goto custom application scripts

	preloadScripts( scriptsToPreload, preloadLanguageDepententCustomScripts );
}

function preloadLanguageDepententCustomScripts()
{
	var scriptsToPreload = [];

	// now we add the custom applications if configured

	if ( globalSettings.hasCustomContent )
	{
		for ( var counter = 0; counter < globalSettings.availableLanguages.length; counter++ )
		{
			// make sure data structure is initialised

			allApplicationsArray[ globalSettings.availableLanguages[counter] ] = allApplicationsArray[ globalSettings.availableLanguages[counter] ] || [];

			// add script to preload array

			scriptsToPreload.push( { 'scriptId' : globalSettings.availableLanguages[counter] + '_applications' + globalSettings.customContentPostfix , 'scriptSource' : 'data' + globalSettings.customContentPostfix + '/' + globalSettings.availableLanguages[counter] + '_applications.js' } );
		}
	}

	// then we load the added custom applications and goto application depentent scripts

	preloadScripts( scriptsToPreload, preloadApplicationDepententScripts );
}

function preloadApplicationDepententScripts()
{
	var scriptsToPreload = [];

	var allApplicationsHashtable = getAllApplicationsArray();

	var currentApplications = null;
	var currentApplication  = null;

	// load all the applications for all languages

	for( var currentLanguage in allApplicationsHashtable )
	{
		currentApplications = allApplicationsHashtable[ currentLanguage ];

		for ( var counter = 0; counter < currentApplications.length; counter++ )
		{
			currentApplication = currentApplications[ counter ];

			if ( ( currentApplication.isCustom != null ) && ( currentApplication.isCustom ) )
			{
				// custom applications

				scriptsToPreload.push( { 'scriptId' : currentLanguage + '_' + currentApplication.id + '_suggestions', 'scriptSource' : 'data' + globalSettings.customContentPostfix + '/' + currentLanguage + '/' + currentApplication.suggestionUrl } );
				scriptsToPreload.push( { 'scriptId' : currentLanguage + '_' + currentApplication.id + '_content',     'scriptSource' : 'data' + globalSettings.customContentPostfix + '/' + currentLanguage + '/' + currentApplication.contentUrl } );
			}
			else
			{
				// configured Know How! AG applications

				scriptsToPreload.push( { 'scriptId' : currentLanguage + '_' + currentApplication.id + '_suggestions', 'scriptSource' : 'data/' + currentLanguage + '/' + currentApplication.suggestionUrl } );
				scriptsToPreload.push( { 'scriptId' : currentLanguage + '_' + currentApplication.id + '_content',     'scriptSource' : 'data/' + currentLanguage + '/' + currentApplication.contentUrl } );
			}
		}
	}

	// thats all for the moment -> we can initialize the components

	preloadScripts( scriptsToPreload, initializeComponents );
}

/* ------------------------------------------------------- */
/* All Components                                          */
/* ------------------------------------------------------- */

function initializeComponents()
{
	// do the required stuff

	initializeHelp();

	initializeLanguages();

	initializeMenus();

	initializeApplications();

	initializeScrollbars();

	initializeAutocomplete();

	initializeContent();

	initializeShareFunctions();

	initializeAdditionalButtons();

	// hide loader

    hideLoader();

    // start search if corresponding parameters were given

    initializeParameterSearch();
}

/* ------------------------------------------------------- */
/* Views                                                   */
/* ------------------------------------------------------- */

function showBaseView()
{
	// empty elements

	$( '#search_input' ).val( '' );

	$( '#result_list_content' ).html( '' );
	$( '#result_list_additional_content' ).html( '' );

	// Reset search

	lastSearchString = 'not_set';

	// hide additional result list header

	$( '#result_list_additional_content_header' ).hide();

	// activate / deactivate help

	activateBaseViewHelp();

	// modify view

	$( '#result_container' ).hide();

	$( '#application_selector' ).selectric( 'close' );

	$( '#search_container' ).animate(
	{
	    top: '250px',
	},
	200,
	'linear',
	function()
	{
		// show other components

		$( '#nuggetfinder_logo' ).show();

		// show additional buttons

		if ( globalSettings.enableAdditionalButtons )
		{
			$( '#additional_buttons_container' ).show();
		}

		// remove focus from input

		$( '#search_input' ).blur();
	});
}

function showSearchResultView()
{
	// activate / deactivate help

	activateSearchResultViewHelp();

	// modify view

	$( '#nuggetfinder_logo' ).hide();

	$( '#additional_buttons_container' ).hide();

	$( '#application_selector' ).selectric( 'close' );

	$( '#search_container' ).animate(
	{
	    top: '0px',
	},
	200,
	'linear',
	function()
	{
		// show other components

		$( '#result_container' ).show();

		// start the search

		window.setTimeout( 'doSearchInternal()', 100 );
	});
}

/* ------------------------------------------------------- */
/* Help                                                    */
/* ------------------------------------------------------- */

function initializeHelp()
{
	// bind click on close icon

	$( '#help_close' ).bind( 'click.helpEvents', function( event ) { closeHelp(); } );

	// bind ESC click => close

	$( window ).bind( 'keydown.windowEvents', function( event ) { helpKeyHandler( event ); } );
}

function showHelp()
{
	// check if language button is visible

	if ( $( '#top_menu_language' ).is( ':hidden' ) )
	{
		$( '#help_background_language' ).hide();
	}

	// calculate position of moveable element help (headline / share mode)

	calculateDynamicHelpPosition();

	// show help

	$( '#help_background' ).show();

	// active resize handler

	$( window ).on( 'resize', calculateDynamicHelpPosition );
}

function closeHelp()
{
	$( '#help_background' ).hide();

	// unbind resize function

	$( window ).off( 'resize', calculateDynamicHelpPosition );
}

function helpKeyHandler( event )
{
	// ESC Key

	if ( event.keyCode === 27 )
	{
		closeHelp();
	}
}

function activateBaseViewHelp()
{
	$( '#help_background_application_big' ).show();
	$( '#help_background_application_small' ).show();

	$( '#help_background_search_big' ).show();
	$( '#help_background_search_small' ).show();

	$( '#help_background_back_to_base' ).hide();

	$( '#help_background_open_nugget_big' ).hide();
	$( '#help_background_open_nugget_small' ).hide();

	$( '#help_background_share_nugget_big' ).hide();
	$( '#help_background_share_nugget_small' ).hide();
}

function activateSearchResultViewHelp()
{
	$( '#help_background_application_big' ).hide();
	$( '#help_background_application_small' ).hide();

	$( '#help_background_search_big' ).hide();
	$( '#help_background_search_small' ).hide();

	$( '#help_background_back_to_base' ).show();

	$( '#help_background_open_nugget_big' ).show();
	$( '#help_background_open_nugget_small' ).show();

	$( '#help_background_share_nugget_big' ).show();
	$( '#help_background_share_nugget_small' ).show();
}

function calculateDynamicHelpPosition()
{
	var closestHeadlineTop = findClosestElementTopByClassNameAndPreferedTopValue( 'content_element_headline', parseInt( $( window ).height() / 2, 10 ) );

	if ( closestHeadlineTop > 0 )
	{
		$( '#help_background_open_nugget_big'   ).css( 'top', ( closestHeadlineTop - 10 ) + 'px' );
		$( '#help_background_open_nugget_small' ).css( 'top', ( closestHeadlineTop + 15 ) + 'px' );

		$( '#help_background_open_nugget_big'   ).show();
		$( '#help_background_open_nugget_small' ).show();
	}
	else
	{
		$( '#help_background_open_nugget_big'   ).hide();
		$( '#help_background_open_nugget_small' ).hide();
	}

	var closestShareButtonTop = findClosestElementTopByClassNameAndPreferedTopValue( 'content_element_headline', parseInt( $( window ).height() / 2, 10 ) );

	if ( closestShareButtonTop > 0 )
	{
		$( '#help_background_share_nugget_big'   ).css( 'top', ( closestShareButtonTop - 10 ) + 'px' );
		$( '#help_background_share_nugget_small' ).css( 'top', ( closestShareButtonTop + 15 ) + 'px' );

		$( '#help_background_share_nugget_big'   ).show();
		$( '#help_background_share_nugget_small' ).show();
	}
	else
	{
		$( '#help_background_share_nugget_big'   ).hide();
		$( '#help_background_share_nugget_small' ).hide();
	}
}

/* ------------------------------------------------------- */
/* Languages                                               */
/* ------------------------------------------------------- */

function initializeLanguages()
{
	// just set the language dependent texts

	setLanguageDependentTextsAndTooltips();
}

function onLanguageChange()
{
	// mark current language in menu

	markCurrentLanguageInMenu();

	// handle language dependent links

	setLanguageDependentMenuHrefs();

	// set language dependent texts

	setLanguageDependentTextsAndTooltips()

	// reinitialize the applications

	initializeApplications();

	// clear last search

	lastSearchString = 'not_set';

	// show initial base view after language change

	showBaseView();
}

function markCurrentLanguageInMenu()
{
	// unmark last language

	$( '.language_sub_menu_button' ).removeClass( 'selected' );

	// mark current language

	$( '#' + language.getLanguage() ).addClass( 'selected' );
}

function setLanguageDependentTextsAndTooltips()
{
	// menu and sub menu texts

	$( '#top_menu_language_title' ).html( language.getString( 'top_menu_language_title' ) );
	$( '#top_menu_main_title' ).html( language.getString( 'top_menu_main_title' ) );

	$( '#sub_menu_language_title' ).html( language.getString( 'sub_menu_language_title' ) );

	$( '#sub_menu_main_title' ).html( language.getString( 'sub_menu_main_title' ) );
	$( '#sub_menu_main_help_title' ).html( language.getString( 'sub_menu_main_help_title' ) );
	$( '#sub_menu_main_privacy_title' ).html( language.getString( 'sub_menu_main_privacy_title' ) );
	$( '#sub_menu_main_copyright_title' ).html( language.getString( 'sub_menu_main_copyright_title' ) );
	$( '#sub_menu_main_imprint_title' ).html( language.getString( 'sub_menu_main_imprint_title' ) );

	// set help texts

	$( '#help_background_application_big' ).html( language.getString( 'help_application' ) );
	$( '#help_background_application_small' ).html( language.getString( 'help_application' ) );

	$( '#help_background_search_big' ).html( language.getString( 'help_search' ) );
	$( '#help_background_search_small' ).html( language.getString( 'help_search' ) );

	$( '#help_background_language' ).html( language.getString( 'help_language' ) );
	$( '#help_background_close' ).html( language.getString( 'help_close' ) );
	$( '#help_background_back_to_base' ).html( language.getString( 'help_back_to_base_view' ) );

	$( '#help_background_open_nugget_big' ).html( language.getString( 'help_open_nugget' ) );
	$( '#help_background_open_nugget_small' ).html( language.getString( 'help_open_nugget' ) );

	$( '#help_background_share_nugget_big' ).html( language.getString( 'help_share_nugget' ) );
	$( '#help_background_share_nugget_small' ).html( language.getString( 'help_share_nugget' ) );

	$( '#help_resize_required' ).html( language.getString( 'help_resize_required' ) );

	// handle tooltips

	$( '#header_logo' ).attr( 'title', language.getString( 'tooltip_logo' ) );
	$( '#header_logo' ).attr( 'alt',   language.getString( 'tooltip_logo' ) );

	$( '#help_close' ).attr( 'title', language.getString( 'tooltip_help_close' ) );
	$( '#help_close' ).attr( 'alt',   language.getString( 'tooltip_help_close' ) );

	$( '#search_button' ).attr( 'title', language.getString( 'tooltip_start_search' ) );
	$( '#search_button' ).attr( 'alt',   language.getString( 'tooltip_start_search' ) );

	// Nugget Finder name

	$( '#nuggetfinder_logo' ).attr( 'data-title', language.getString( 'headline_title' ) );

	// handle other texts

	$( '#search_input' ).attr( 'placeholder', language.getString( 'search_placeholder' ) );

	$( '#show_all_button' ).html( language.getString( 'show_all_button' ) );

	$( '#result_list_additional_content_header' ).html( language.getString( 'additional_results_title' ) );

	$( '#load_message' ).html( language.getString( 'load_message' ) );

	$( '#search_load_message' ).html( language.getString( 'perform_search' ) );
}

function saveCurrentLanguageInLocalStorage()
{
	var isLocalStorageAvailable = checkLocalStorage();

	if ( isLocalStorageAvailable )
	{
		localStorage.setItem( 'localLanguage', language.getLanguage() );
	}
}

function getCurrentLanguageFromLocalStorage()
{
	var isLocalStorageAvailable = checkLocalStorage();

	if ( isLocalStorageAvailable )
	{
		var localLanguage = localStorage.getItem( 'localLanguage' );

		if ( globalSettings.availableLanguages.indexOf( localLanguage ) !== -1 )
		{
			return ( localLanguage );
		}
	}

	// return currentLanguage

	return ( language.getLanguage() );
}

function checkLocalStorage()
{
	if ( typeof this.isLocalStorageAvailable !== 'undefined' )
	{
		return ( this.isLocalStorageAvailable );
	}
	else
	{
		this.isLocalStorageAvailable = false;

		try
		{
			localStorage.setItem( 'localStorageTest', 'localStorageTest' );
			localStorage.removeItem( 'localStorageTest' );

			this.isLocalStorageAvailable = true;
		}
		catch (e)
		{
			// kann ignoriert werden
		}

		return ( isLocalStorageAvailable );
	}
}

/* ------------------------------------------------------- */
/* Applications                                            */
/* ------------------------------------------------------- */

function initializeApplications()
{
	$( '#application_selector' ).html( '' );

	// get current language

	var currentLanguage = language.getLanguage();

	// set applications to show

	setApplicationsToShow( currentLanguage );

	// create applications

	var currentApplicationsToShow = getApplicationsToShow();
	var currentApplication        = null;

	for ( var counter = 0; counter < currentApplicationsToShow.length; counter++ )
	{
		currentApplication = currentApplicationsToShow[ counter ];

		// create html

		$( '#application_selector' ).append( '<option id="' + currentApplication.id + '" class="' + currentApplication.classNames + '" value="' + currentApplication.id + '">' + currentApplication.title + '</option>' );
	}

	// create selectric

	$( '#application_selector' ).selectric(
	{
		optionsItemBuilder: function( itemData, element, index )
		{
    		return ( '<span><i class="' + element.attr( 'class' ) + '"></i><span>' + itemData.text );
  		},
  		labelBuilder: function( currItem )
		{
			return ( '<span><i class="' + currItem.element.attr( 'class' ) + '"></i><span>' );
  		},
  		onChange: function( element )
  		{
		    setApplicationId( $(this).val() );

		    if ( globalSettings.searchEmptyInputAfterApplicationChange )
		    {
				$( '#search_input' ).val( '' )
		    }

			lastSearchString = 'not_set';

			$( '#result_container' ).hide();

			$( '#result_list_content' ).html( '' );
			$( '#result_list_additional_content_header' ).hide();
			$( '#result_list_additional_content' ).html( '' );
		},
		disableOnMobile: false,
		nativeOnMobile: false
  	} );

	$( '.search_application_container .selectric .button' ).attr( 'title', language.getString( 'tooltip_choose_application' ) );
	$( '.search_application_container .selectric .button' ).attr( 'alt',   language.getString( 'tooltip_choose_application' ) );

  	// set initial value

  	setApplicationId( $( '#application_selector' ).val() );
}

function updateApllicationSelectionBox()
{
	// Refresh Selectric

	$( '#application_selector' ).selectric( 'refresh' );
}

/* ------------------------------------------------------- */
/* Scrollbars                                              */
/* ------------------------------------------------------- */

function initializeScrollbars()
{
	$( '.scrollbar-inner' ).scrollbar(
	{
        'onScroll': function( y, x )
        {
			if ( y.scroll == y.maxScroll )
			{
				window.setTimeout( 'onScrolledToBottom()', 0 );
			}
		}
	} );
}

function onScrolledToBottom()
{
	// automatic show more?

	if ( globalSettings.searchShowMoreElementsAutomatically )
	{
		$( '.result_list_more_content_text:visible' ).last().click();
	}
}

/* ------------------------------------------------------- */
/* Autocomplete                                            */
/* ------------------------------------------------------- */

function initializeAutocomplete()
{
	var noResultText = '';

	if ( globalSettings.searchShowNoSuggestionNotice )
	{
		noResultText = language.getString( 'suggestions_no_results' );
	}

	$( '#search_input' ).typeahead(
	{
	    order: "asc",
	    minLength: globalSettings.searchSuggestionsMinChars,
    	maxItem: globalSettings.searchSuggestionsLookupLimit,
	    offset: globalSettings.searchSuggestionsMustStartWithQuery,
    	hint: globalSettings.searchShowHint,
    	accent: globalSettings.searchSuggestionsIgnoreAccent,
    	searchOnFocus: globalSettings.searchSuggestionsOnFocus,
    	emptyTemplate: noResultText,
    	source: {
	        data: getSuggestionsArray()
	    },
	    callback: {
		    onClickAfter: function ( node, a, item, event )
	        {
	        	if ( globalSettings.searchStartAfterSuggestionSelect )
	        	{
	            	readTextInputAndStartSearch();
	            }
	        }
	    }
	});

	// empty search field

	$( '#search_input' ).val( '' );

	// bind enter key on input field

	$( '#search_input' ).bind( 'keydown.searchEvents', function( event ) { autocompleteEnterKeyHandler( event ); } );

	// bind click an search icon

	$( '#search_button' ).bind( 'click.searchEvents', function( event ) { readTextInputAndStartSearch(); } );
}

function autocompleteUpdateLookup()
{
	// empty values

	$( '#search_input' ).typeahead( 'destroy' );

	$( '.typeahead-result' ).remove();

	// neu initialieren

	initializeAutocomplete();
}

function autocompleteEnterKeyHandler( event )
{
	if ( event.keyCode === 13 )
	{
		readTextInputAndStartSearch();
	}
}

/* ------------------------------------------------------- */
/* Search                                                  */
/* ------------------------------------------------------- */

var lastSearchString = 'not_set';

function initializeParameterSearch()
{
	// are search parameters available

	var languageToSearch = getParam( 'language' );
    var searchPattern    = getParam( 'query' );
    var applicationId    = getParam( 'appId' );

    try
    {
    	// decode searchPattern string

        searchPattern = decodeURIComponent( searchPattern );
    }
    catch (e)
    {
        searchPattern = null;

        console.error(e);
    }

    if ( ( languageToSearch != null ) && ( searchPattern != null ) && ( applicationId != null ) )
	{
        setSearchInfoAndStartSearch( languageToSearch, searchPattern, applicationId );
    }
}

function setSearchInfoAndStartSearch( languageToSearch, searchPattern, applicationId )
{
	// check if language is available

	var languageAvailable = false;

	for ( var counter = 0; counter < globalSettings.availableLanguages.length; counter++ )
	{
		if ( globalSettings.availableLanguages[ counter ] == languageToSearch )
		{
			languageAvailable = true;

			break;
		}
	}

	if ( ! languageAvailable )
	{
		showErrorMessage( language.getString( 'language_not_available' ) );

		return;
	}

	// check if application is available - if not try to set "all" search

	if ( ! isApplicationAvailableForCurrentLanguage( applicationId ) )
	{
		if ( globalSettings.applicationGenerateAll )
		{
			// we can use the all search

			applicationId = globalSettings.applicationAllId;
		}
		else
		{
			// "all" is not available - cancel search

			showErrorMessage( language.getString( 'application_not_available' ) );

			return;
		}
	}

	// set application id

	setApplicationId( applicationId );

	// modify application selection drop down

    $( '#application_selector' ).val( applicationId );

    updateApllicationSelectionBox();

	// set query as search input

    $( '#search_input' ).val( searchPattern );

	// start search

    readTextInputAndStartSearch();
}

function readTextInputAndStartSearch()
{
	// set pattern

	setSearchPattern( $( '#search_input' ).val() );

	// and start search

	window.setTimeout( 'doStartSearch()', 0 );
}

function doStartSearch()
{
	// get search pattern

	var currentSearchPattern = $.trim( getSearchPattern() );

	// is it a new search

	if ( currentSearchPattern == lastSearchString )
	{
		// no changes - cancel search

		return;
	}

	// remember last search

	lastSearchString = currentSearchPattern;

	// modify view

	showSearchResultView();
}

function doSearchInternal()
{
	// show search loader

	showSearchLoader();

	// set xAPI Statement

	sendSearchedStatement();

	// get search pattern

	var currentSearchPattern = $.trim( getSearchPattern() );

	// do the search

	if ( currentSearchPattern == '' )
	{
		if ( globalSettings.searchAllowEmptyQuerys )
		{
			// set all elements to display

			setContentElementsToShow( getContentElementsToSearch() );

			// show them

			setTimeout( 'showContentElements();', 500 );
		}
		else
		{
			showErrorMessage( language.getString( 'query_not_set' ) );

			// hide loader

			hideSearchLoader();
		}

		return;
	}

	// now start a real search (looping a array is not the best way)

	var regularExpressions = generateRegularExpressionsForSearchPattern( currentSearchPattern );

	var searchResult = [];

	// search in current application content objects

	$.each( getContentElementsToSearch(), function( index, currentElement )
	{
		if ( checkElementMatchesExpressions( currentElement, regularExpressions ) )
        {
            searchResult.push( currentElement );
        }
    });

	// sort the result

	searchResult.sort( HitCountComparator );

	// not enough results

	if ( searchResult.length < globalSettings.searchResultLimitToIgnoreOtherApplications )
	{
		// now we have to search in the other applications

		var additionalResultsArray = searchOtherApplicationsForAdditionalResults( regularExpressions );

		if ( additionalResultsArray.length > 0 )
		{
			// sort additional results

			additionalResultsArray.sort( HitCountComparator );
		}
	}

	setContentElementsToShow( searchResult, additionalResultsArray );
}


function searchOtherApplicationsForAdditionalResults( regularExpressions )
{
	var additionalResults = [];

	var additionalContentElements = getAdditionalContentElementsToSearch();

	var currentElement = null;

	for ( var counter = 0; counter < additionalContentElements.length; counter++ )
	{
		currentElement = additionalContentElements[ counter ];

		if ( checkElementMatchesExpressions( currentElement, regularExpressions ) )
        {
            additionalResults.push( currentElement );
        }

		if ( additionalResults.length >= globalSettings.searchOtherApplicationsResultLimit )
		{
			// break if we have reached the configured value

			break;
		}
	}

	return ( additionalResults );
}

function generateRegularExpressionsForSearchPattern( currentSearchPattern )
{
	// case sensitivity

	var flags = '';

	if ( globalSettings.searchIgnoreCase )
	{
		flags += 'i';
	}

	// now we split the search pattern

	var searchPatternArray = currentSearchPattern.split( ' ' );

	// lets build the RegExp objects

	var regularExpressions = [];

	$.each( searchPatternArray, function( index, searchPatternPart )
	{
		regularExpressions.push( new RegExp( searchPatternPart, flags ) );
	});

	return ( regularExpressions );
}

function checkElementMatchesExpressions( currentElement, regularExpressionsArray )
{
	if ( currentElement )
	{
		// 1. check if element matches the expressions (combine title and description for search)

		var stringMatchesExpressions = checkStringMatchesExpressions( currentElement.title + ' ' + currentElement.description, regularExpressionsArray );

		// 2. calculate weight of matches

		var hitCount = 0;

		if ( stringMatchesExpressions )
		{
			var globalRegularExpression = null;
			var matchResult = null;

			// case sensitivity

			var newFlags = 'g';

			if ( globalSettings.searchIgnoreCase )
			{
				newFlags += 'i';
			}

			$.each( regularExpressionsArray, function ( index, regularExpression )
			{
				// convert regex to global

				globalRegularExpression = new RegExp( regularExpression.source, newFlags );

				// calculate match result for title with boost

				matchResult = currentElement.title.match( globalRegularExpression );

				if ( matchResult != null )
				{
					hitCount += ( matchResult.length * globalSettings.searchHitBoostTitle );
				}

				// calculate match result for description with boost

				matchResult = currentElement.description.match( globalRegularExpression );

				if ( matchResult != null )
				{
					hitCount += ( matchResult.length * globalSettings.searchHitBoostDescription );
				}
			});

			// insert hit count in object

			currentElement.hitCount = hitCount;
		}

		return ( stringMatchesExpressions );
	}
}

function checkStringMatchesExpressions( stringToCheck, regularExpressionsArray )
{
	var stringMatchesExpressions = null;

	if ( globalSettings.searchOperator == 'and' )
	{
		// AND search

		$.each( regularExpressionsArray, function ( index, regularExpression )
		{
			if ( stringToCheck.search( regularExpression ) == -1 )
			{
				stringMatchesExpressions = false;

				return ( false );
			}
		});

		if ( stringMatchesExpressions == null )
		{
			stringMatchesExpressions = true;
		}
	}
	else
	{
		// OR search

		$.each( regularExpressionsArray, function ( index, regularExpression )
		{
			if ( stringToCheck.search( regularExpression ) != -1 )
			{
				stringMatchesExpressions = true;

				return ( false );
			}
		});

		if ( stringMatchesExpressions == null )
		{
			stringMatchesExpressions = false;
		}
	}

	return ( stringMatchesExpressions );
}

/* ------------------------------------------------------- */
/* Content                                                 */
/* ------------------------------------------------------- */

function initializeContent()
{
	// configure the render converter for the view templates

	$.views.converters( 'lower', function( val )
	{
		return ( val.toLowerCase() );
	});

	$.views.converters( 'classNamesForApplicationId', function( applicationId, applicationTitle )
	{
		return ( getClassNamesForApplication( applicationId, applicationTitle.toLowerCase().replace( / /g, '_' ) ) );
	});

	$.views.converters( 'languageStringForKey', function( key )
	{
		return ( language.getString( key ) );
	});

	// and functions

	$.views.helpers( 'getElementsPerPage', function()
	{
		return ( globalSettings.searchShowResultPerPage );
	});

	// bind resize event for overlay

	$( window ).resize( function()
	{
		resizeOverlay();
	});
}

function showContentElements()
{
	// render content

	var contentElementsToRender = getContentElementsToShow();

	if ( contentElementsToRender.length > 0 )
	{
		$( '#result_list_content' ).html( $( '#contentElementTemplate' ).render( contentElementsToRender ) );
	}
	else
	{
		// remove content

		$( '#result_list_content' ).html( '' );
	}

	// render additional content

	var additionalContentElementsToRender = getAdditionalContentElementsToShow();

	if ( additionalContentElementsToRender.length > 0 )
	{
		// show headline

		if ( contentElementsToRender.length > 0 )
		{
			$( '#result_list_additional_content_header' ).removeClass().addClass( 'result_list_additional_content_header_middle' );
		}
		else
		{
			$( '#result_list_additional_content_header' ).removeClass().addClass( 'result_list_additional_content_header_top' );
		}

		$( '#result_list_additional_content_header' ).show();

		// render content

		$( '#result_list_additional_content' ).html( $( '#contentElementTemplate' ).render( additionalContentElementsToRender ) );
	}
	else
	{
		// hide headline

		$( '#result_list_additional_content_header' ).hide();

		// remove content

		$( '#result_list_additional_content' ).html( '' );
	}

	// are there any results

	if (  ( contentElementsToRender.length > 0 ) || ( additionalContentElementsToRender.length > 0 ) )
	{
		// highlight results

		if ( globalSettings.searchHighlightResults )
		{
			highlightContentElementResults( getSearchPattern() );
		}

		// show the result container (if not allready done)

		$( '#result_container' ).show();

		// initialize dot dot dot

		$( '.content_element_description' ).dotdotdot(
		{
			after: 'span.more',
			watch: 'window',
			fallbackToLetter: true,
			callback: onContentElementDotDotDotCallback
		});
	}
	else
	{
		// no results

		$( '#result_list_content' ).html( '<p class="no_result">' + language.getString( 'search_no_results' ) + '</p>' );

		// show the result container (if not allready done)

		$( '#result_container' ).show();
	}

	// hide search loader

	hideSearchLoader();
}

function highlightContentElementResults( currentSearchPattern )
{
	if ( ( currentSearchPattern == null ) || ( $.trim( currentSearchPattern ).length == 0 ) )
	{
		// no pattern no highlight

		return;
	}

	var searchPatternArray = currentSearchPattern.split( ' ' );

	// sort it

	searchPatternArray.sort( SortByLengthDesc );

	// the highlight the results

	for ( var counter = 0; counter < searchPatternArray.length; counter++ )
	{
		$( '.content_element_headline'    ).highlight( searchPatternArray[ counter ] );
		$( '.content_element_description' ).highlight( searchPatternArray[ counter ] );
	}
}

function onShowMoreContentElementsButtonClick( clickedElement )
{
	// hide this more button

	$( clickedElement ).hide();

	// search next content elements block

	if ( ! $( clickedElement ).parent().parent().next().hasClass( 'result_list_additional_content_header_middle' ) )
	{
		$( clickedElement ).parent().parent().next().show();

		// update dotdotdot for new elements

		$( '.content_element_description', $( clickedElement ).parent().parent().next() ).trigger( 'update' );
	}
}

function onContentElementMoreButtonClick( clickedElement )
{
	var nuggetId = $( clickedElement ).attr( 'data-nuggetId' );

	if ( globalSettings.contentMode == 'toggle' )
	{
		// destroy dotdotdot on description Element

	    $( '#content_element_description_' + nuggetId ).trigger( 'destroy' );

	    // hide more

		$( 'span.more', $( '#content_element_description_' + nuggetId ) ).hide();

		$( clickedElement ).hide();

		// open current element

	    $( '#content_element_description_' + nuggetId ).removeClass( 'short' );

	    // show less

	    $( '#less_' + nuggetId ).show();
	}
	else if ( globalSettings.contentMode == 'accordeon' )
	{
		// close opened element

		$( '.less:visible' ).click();

		// destroy dotdotdot on description Element

	    $( '#content_element_description_' + nuggetId ).trigger( 'destroy' );

	    // hide more

		$( 'span.more', $( '#content_element_description_' + nuggetId ) ).hide();

		$( clickedElement ).hide();

		// open current element

	    $( '#content_element_description_' + nuggetId ).removeClass( 'short' );

	    // show less

	    $( '#less_' + nuggetId ).show();
	}
	else
	{
		showErrorMessage( language.getString( 'unknown_configuration_value' ) + 'globalSettings.contentMode' );
	}
}

function onContentElementLessButtonClick( clickedElement )
{
	// hide button

	$( clickedElement ).hide();

	// add class

	$( clickedElement ).parent().addClass( 'short' );

	// reinitialize .dotdotdot

	$( clickedElement ).parent().dotdotdot(
	{
		after: 'span.more',
		watch: 'window',
		fallbackToLetter: true,
		callback: onContentElementDotDotDotCallback
	} );
}

function onContentElementDotDotDotCallback( isTruncated, originalContent )
{
	if ( ! isTruncated )
	{
		$( 'span.more, span.less', this ).remove();
	}
}

function onContentElementPlayButtonClick( clickedElement )
{
	// retrieve data

	var nuggetApplication = $( clickedElement ).attr( 'data-nuggetApplication' );

	var contentHref = getNuggetBasePath() + getNuggetPlayerUrl();

	var nuggetId   = $( clickedElement ).attr( 'data-nuggetId' );
	var nuggetBase = $( clickedElement ).attr( 'data-nuggetBase' );

	var nuggetIsCustom = $( clickedElement ).attr( 'data-nuggetIsCustom' );

	if ( ( nuggetIsCustom != null ) && ( '' + nuggetIsCustom.toLowerCase() == 'true' ) )
	{
		// this is a custom nugget

		contentHref = contentHref.replace( new RegExp( '{optionalCustomContentPostfix}', 'g' ), globalSettings.customContentPostfix );
	}
	else
	{
		// not set or not custom

		contentHref = contentHref.replace( new RegExp( '{optionalCustomContentPostfix}', 'g' ),'' );
	}

	// check if nugget is available

	var nuggetAvailable = true;

	if ( globalSettings.isDemoMode )
	{
		// ok, we are a demo - nugget could be missing

		if ( globalSettings.demoApplicationIds.indexOf( nuggetApplication.toLowerCase() ) > -1 )
		{
			// application is available - check nuggets

			if ( globalSettings.demoNuggetIds.length > 0 )
			{
				var nuggetIdentifier = $( clickedElement ).attr( 'data-nuggetIdentifier' );

				if ( globalSettings.demoNuggetIds.indexOf( nuggetIdentifier.toLowerCase() ) > -1 )
				{
					// this nugget is available

					nuggetAvailable = true;
				}
				else
				{
					// nugget is not part of the demo

					nuggetAvailable = false;
				}
			}
			else
			{
				// all nuggets of demo applications are available

				nuggetAvailable = true;
			}
		}
		else
		{
			// application is not part of the demo

			nuggetAvailable = false;
		}
	}

	// show nugget or error message

	if ( nuggetAvailable )
	{
		sendNuggetLaunchedStatement( nuggetBase );

		var nuggetContainer = getNuggetById( nuggetBase );

		setCurrentNuggetContainer( nuggetContainer );

		// replace nugget values

		contentHref = contentHref.replace( new RegExp( '{nuggetId}', 'g'), nuggetId );
		contentHref = contentHref.replace( new RegExp( '{nuggetBase}', 'g'), nuggetBase );

		if ( globalSettings.contentStartNuggetOpenMethod == 'window' )
		{
			openBrowserWindow( contentHref, 'ContentWindow', globalSettings.windowWidthDefault, globalSettings.windowHeightDefault, this, false );
		}
		else if ( globalSettings.contentStartNuggetOpenMethod == 'overlay' )
		{
			showNuggetInOverlay( contentHref )
		}
		else
		{
			showErrorMessage( language.getString( 'unknown_configuration_value' ) + 'globalSettings.contentStartNuggetOpenMethod' );
		}
	}
	else
	{
		showInfoMessage( language.getString( 'not_available' ) );
	}
}

/* ------------------------------------------------------- */
/* Share functions                                         */
/* ------------------------------------------------------- */

var shareButtonWidth = null;
var shareFunctionsContainerWidth = null;

function initializeShareFunctions()
{
	if ( globalSettings.enableShareModeOnStart )
	{
		$( 'body' ).addClass( 'share_mode' );
	}

	if ( globalSettings.enableShareModeToggle )
	{
		document.addEventListener( 'keydown', function ( event )
		{
			event = event || window.event;

			if ( event.keyCode == 83 && event.ctrlKey && event.shiftKey )
			{
				toggleShareMode();

				cancelEvents( event );
			}
		}, false);
	}

	// mit Paramter startbar...

	if ( globalSettings.enableShareModeParameter )
	{
		if ( '' + getParam( 'showShareMode', 'false' ).toLowerCase() == 'true' )
		{
			$( 'body' ).addClass( 'share_mode' );
		}
	}

	// Welche Funktionen sind aktiviert

	var enabledShareFunctions = 1;

	if ( globalSettings.enableShareButtonMail )
	{
		// CSS Regel erstellen

		$( '<style type=\'text/css\'> .content_element_share_function_mail { display: inline-block !important; } </style>' ).appendTo( 'head' );

		// Zaehler erhoehen

		enabledShareFunctions++;
	}

	if ( globalSettings.enableShareButtonClipboard )
	{
		// CSS Regel erstellen

		$( '<style type=\'text/css\'> .content_element_share_function_clipboard { display: inline-block !important; } </style>' ).appendTo( 'head' );

		// Zaehler erhoehen

		enabledShareFunctions++;
	}

	// dynamische Breitenermittlung

	shareButtonWidth = 25;
	shareFunctionsContainerWidth = ( shareButtonWidth * enabledShareFunctions ) + enabledShareFunctions;
}

function toggleShareMode()
{
	$( 'body' ).toggleClass( 'share_mode' );
}

function onShareFunctionToggleButtonClick( clickedElement )
{
	if ( $( clickedElement ).hasClass( 'selected' ) )
	{
		// Selected entfernen

		$( clickedElement ).removeClass( 'selected' );

		// Container zufahren

		$( clickedElement ).parent().find( '.content_element_share_functions_container' ).animate(
		{
			width: shareButtonWidth + 'px'
		},
		250 );
	}
	else
	{
		// eventuell anderen Container schliessen

		hideActiveShareFunctionsContainer();

		// Element selektieren

		$( clickedElement ).addClass( 'selected' );

		// Container auffahren

		$( clickedElement ).parent().find( '.content_element_share_functions_container' ).animate(
		{
			width: shareFunctionsContainerWidth + 'px'
		},
		250 );
	}
}

function hideActiveShareFunctionsContainer()
{
	// wenn es aktuell ein selektiertes Element gibt wird dieses geschlossen

	$( '.content_element_share_functions_toggle.selected' ).parent().find( '.content_element_share_functions_container' ).animate(
	{
		width: shareButtonWidth + 'px'
	},
	250,
	function ()
	{
		$( this ).parent().find( '.content_element_share_functions_toggle' ).removeClass( 'selected' );
	});
}

function onShareFunctionClipboardButtonClick( clickedElement )
{
	// retrieve data

	var nuggetApplication = $( clickedElement ).parent().attr( 'data-nuggetApplication' );

	var nuggetId = $( clickedElement ).parent().attr( 'data-nuggetId' );
	var nuggetBase = $( clickedElement ).parent().attr( 'data-nuggetBase' );

	var nuggetIdentifier = $( clickedElement ).parent().attr( 'data-nuggetIdentifier' );

	var nuggetTitle = $( clickedElement ).parent().find( '.content_element_share_title_helper' ).html();

	var nuggetIsCustom = $( clickedElement ).parent().attr( 'data-nuggetIsCustom' );

	// execute function

	executeShareFunction( nuggetApplication, nuggetId, nuggetBase, nuggetIdentifier, nuggetIsCustom, nuggetTitle, 'clipboard' );
}

function onShareFunctionMailButtonClick( clickedElement )
{
	// retrieve data

	var nuggetApplication = $( clickedElement ).parent().attr( 'data-nuggetApplication' );

	var nuggetId = $( clickedElement ).parent().attr( 'data-nuggetId' );
	var nuggetBase = $( clickedElement ).parent().attr( 'data-nuggetBase' );

	var nuggetIdentifier = $( clickedElement ).parent().attr( 'data-nuggetIdentifier' );

	var nuggetTitle = $( clickedElement ).parent().find( '.content_element_share_title_helper' ).html();

	var nuggetIsCustom = $( clickedElement ).parent().attr( 'data-nuggetIsCustom' );

	// execute function

	executeShareFunction( nuggetApplication, nuggetId, nuggetBase, nuggetIdentifier, nuggetIsCustom, nuggetTitle, 'email' );
}

function executeShareFunction( nuggetApplication, nuggetId, nuggetBase, nuggetIdentifier, nuggetIsCustom, nuggetTitle, currentFunction )
{
	// check if nugget is available

	var nuggetAvailable = true;

	if ( globalSettings.isDemoMode )
	{
		// ok, we are a demo - nugget could be missing

		if ( globalSettings.demoApplicationIds.indexOf( nuggetApplication.toLowerCase() ) > -1 )
		{
			// application is available - check nuggets

			if ( globalSettings.demoNuggetIds.length > 0 )
			{
				if ( globalSettings.demoNuggetIds.indexOf( nuggetIdentifier.toLowerCase() ) > -1 )
				{
					// this nugget is available

					nuggetAvailable = true;
				}
				else
				{
					// nugget is not part of the demo

					nuggetAvailable = false;
				}
			}
			else
			{
				// all nuggets of demo applications are available

				nuggetAvailable = true;
			}
		}
		else
		{
			// application is not part of the demo

			nuggetAvailable = false;
		}
	}

	// show nugget or error message

	if ( nuggetAvailable )
	{
		var contentHref = getNuggetBasePath() + getNuggetPlayerUrl();

		// replace nugget values

		contentHref = contentHref.replace( new RegExp( '{nuggetId}', 'g' ), nuggetId );
		contentHref = contentHref.replace( new RegExp( '{nuggetBase}', 'g' ), nuggetBase );

		if ( ( nuggetIsCustom != null ) && ( '' + nuggetIsCustom.toLowerCase() == 'true' ) )
		{
			// this is a custom nugget

			contentHref = contentHref.replace( new RegExp( '{optionalCustomContentPostfix}', 'g' ), globalSettings.customContentPostfix );
		}
		else
		{
			// not set or not custom

			contentHref = contentHref.replace( new RegExp( '{optionalCustomContentPostfix}', 'g' ),'' );
		}

		if ( currentFunction == 'email' )
		{
			// create email

			var subject = language.getString( 'mail_subject' ).replace( new RegExp( '{nuggetTitle}', 'g' ), nuggetTitle );

			var message = '';

			message += language.getString( 'mail_body_header' );
			message += '\n\n';
			message += language.getString( 'mail_body_message_one' ).replace( new RegExp( '{nuggetTitle}', 'g' ), nuggetTitle );
			message += '\n\n';
			message += contentHref;
			message += '\n\n';
			message += language.getString( 'mail_body_message_two' ).replace( new RegExp( '{nuggetFinderUrl}', 'g' ), getDocumentBase() );
			message += '\n\n';
			message += language.getString( 'mail_body_footer' );

			// open default mail client

			document.location.href = 'mailto:' + language.getString( 'mail_default_recipient' )
				+ '?subject=' + encodeURIComponent( subject )
				+ '&body=' + encodeURIComponent( message );

			var nugget = getNuggetById( nuggetBase );

			sendNuggetSharedStatement( nugget, currentFunction );
		}
		else if ( currentFunction == 'clipboard' )
		{
			// create clipboard helper

			var clipboard = new Clipboard( '#clipboard_helper_button', {
				text: function () {
					return (contentHref);
				}
			});

			clipboard.on( 'success', function ( event )
			{
				showSuccessMessage( language.getString( 'clipboard_success' ) );

				event.clearSelection();

				var nugget = getNuggetById( nuggetBase );
				sendNuggetSharedStatement( nugget, currentFunction );
			});

			clipboard.on( 'error', function ( event )
			{
				showErrorMessage( language.getString( 'clipboard_error' ) );
			});

			// click clipboard helper

			$( '#clipboard_helper_button' ).click();

			// destroy clipboard button

			clipboard.destroy();
		}
		else
		{
			showErrorMessage( language.getString( 'unknown_configuration_value' ) + 'Share function' );
		}
	}
	else {
		showInfoMessage( language.getString( 'not_available' ) );
	}

	// autoclose

	if ( globalSettings.closeShareFunctionsAfterClick )
	{
		hideActiveShareFunctionsContainer();
	}
}

/* ------------------------------------------------------- */
/* Additional Buttons                                      */
/* ------------------------------------------------------- */

function initializeAdditionalButtons()
{
	// additional buttons enabled (in general)

	if ( globalSettings.enableAdditionalButtons )
	{
		// show container

		$( '#additional_buttons_container' ).show();
	}
	else
	{
		// nothing more to do

		return;
	}

	// show all button enabled

	if ( globalSettings.enableShowShowAllButton )
	{
		// bind click an search all button

		$( '#show_all_button' ).bind( 'click.buttonEvents', function( event ) { showAllNuggets(); } );
	}
	else
	{
		// hide button

		$( '#show_all_button' ).hide();
	}
}

function showAllNuggets()
{
	// empty search field

	$( '#search_input' ).val( '' );

	// reset search

	lastSearchString = 'not_set';

	// remove focus from input

	if ( $( '#search_input' ).is( ':focus' ) )
	{
		$( '#search_input' ).blur();
	}

	// start "search"

	readTextInputAndStartSearch();
}

/* ------------------------------------------------------- */
/* Dialog function                                         */
/* ------------------------------------------------------- */

function showInfoMessage( messageText )
{
	$().toastmessage('showToast', {
	    text     : messageText,
	    sticky   : true,
	    type     : 'notice',
	    position :  'middle-center'
	});
}

function showWarnMessage( messageText )
{
	$().toastmessage('showToast', {
	    text     : messageText,
	    sticky   : true,
	    type     : 'warning',
	    position :  'middle-center'
	});
}

function showErrorMessage( messageText )
{
	$().toastmessage('showToast', {
	    text     : messageText,
	    sticky   : true,
	    type     : 'error',
	    position :  'middle-center'
	});
}

function showSuccessMessage( messageText )
{
	$().toastmessage('showToast', {
	    text     : messageText,
	    sticky   : true,
	    type     : 'success',
	    position :  'middle-center'
	});
}

/* ------------------------------------------------------- */
/* xAPI function                                           */
/* ------------------------------------------------------- */

function sendSearchedStatement()
{
	var statement = {
		verb: "searched",
		object: "finder",
		context: {
			language: language.getLanguage(),
			extensions: {
				"https://knowhow.de/xapi/search": {
					term: getSearchPattern(),
					category: getApplicationId(),
					isSuggestion: ( getSuggestionsArray().indexOf( getSearchPattern() ) !== -1 )
				}
			}
		}
	};

	xapiBasic && ( xapiBasic.trigger( 'search-' + xapiBasic.getRandomUuid() + ':send', statement ) );
}

function sendNuggetSharedStatement( nugget, currentFunction )
{
	var extensions = {
		"https://knowhow.de/xapi/functions/shared": {
			"via": currentFunction
		}
	}

	sendNuggetStatement( "shared", nugget, extensions );
}

function sendNuggetExitedStatement()
{
	globalSettings.sendPlayerExitStatement && sendNuggetStatement( 'exited' );
}

function sendNuggetLaunchedStatement( nuggetBase )
{
	var nuggetContainer = getNuggetById( nuggetBase );

	setCurrentNuggetContainer( nuggetContainer );

	globalSettings.sendPlayerLaunchStatement && sendNuggetStatement( 'launched' );
	globalSettings.sendSearchItemCalledStatement && sendSearchItemCalledStatement( 'called' );
}

function sendNuggetStatement( verb, nugget, contextExtensions )
{
	var nuggetContainer = nugget || getCurrentNuggetContainer();

	if ( nuggetContainer )
	{
		var statement = {
			verb: verb,
			object: {
				id: "https://knowhow.de/xapi/objects/nuggets/" + nuggetContainer.nugget.uuid,
				definition: {
					name: {},
					description: {}
				}
			},
			context: {
				language: language.getLanguage(),
				extensions: {
					"https://knowhow.de/xapi/nugget": nuggetContainer.nugget
				}
			}
		};

		var nuggetLanguage = nuggetContainer.nugget.language || "und";

		statement.object.definition.name[nuggetLanguage] = nuggetContainer.nugget.title;
		statement.object.definition.description[nuggetLanguage] = nuggetContainer.nugget.description;

		if ( contextExtensions )
		{
			for ( var key in contextExtensions )
			{
				if ( contextExtensions.hasOwnProperty( key ) )
				{
					// if the statement does not have the extension key
					// In the current case: Do not override extensions["https://knowhow.de/xapi/nugget"]

					if ( ! ( statement.context.extensions.hasOwnProperty( key ) ) )
					{
						statement.context.extensions[key] = contextExtensions[key];
					}
				}
			}
		}

		if ( verb == 'launched' )
		{
			var exitStatement = xapiBasic.clone( statement );

			exitStatement.verb = 'exited';

			xapiBasic.config.exitStatements['send:nuggetExited'] = exitStatement;

			statement.context.extensions['https://knowhow.de/xapi/menu'] = {
				position: nuggetContainer.position,
				inAdditionalResult: nuggetContainer.inAdditionalResult
			};
		}
		else if ( verb == 'exited' )
		{
			xapiBasic.config.exitStatements['send:nuggetExited'] = null;
		}

		xapiBasic && ( xapiBasic.trigger( verb + '-' + nuggetContainer.nugget.uuid + ':send', statement ) );
	}
}

function sendSearchItemCalledStatement()
{
	var nuggetContainer = getCurrentNuggetContainer();

	if ( nuggetContainer )
	{
		var statement = {
			verb: "called",
			object: "finder",
			context: {
				language: language.getLanguage(),
				extensions: {
					"https://knowhow.de/xapi/nugget": nuggetContainer.nugget,
					"https://knowhow.de/xapi/menu": {
						position: nuggetContainer.position,
						inAdditionalResult: nuggetContainer.inAdditionalResult
					}
				}
			}
		};

		xapiBasic && ( xapiBasic.trigger( 'called-' + nuggetContainer.nugget.uuid + ':send', statement ) );
	}
}