/* ******************************************************* */
/* Menofunctions                                           */
/* ******************************************************* */

/* ------------------------------------------------------- */
/* Initinal Function                                       */
/* ------------------------------------------------------- */

function initializeMenus()
{
	// init top menu buttons

	initializeTopMenuButtons();

	// init sub menus

	initializeLanguageSubMenu();
	initializeMainSubMenu();

	// bind background click => close

	$( window ).bind( 'click.windowEvents', function( event ) { closeAllSubMenus( event ); } );

	// bind ESC click => close

	$( window ).bind( 'keydown.windowEvents', function( event ) { menuKeyHandler( event ); } );
}

/* ------------------------------------------------------- */
/* Top Menu and Overall Functions                         */
/* ------------------------------------------------------- */

function initializeTopMenuButtons()
{
	// language button

	if ( globalSettings.availableLanguages.length > 1 )
	{
		$( '#top_menu_language' ).click( function( event )
		{
			// is sub menu still open

			if ( $( '#sub_menu_language' ).hasClass( 'active' ) )
			{
				// hide language sub menu

				$( '#sub_menu_language' ).hide();
				$( '#sub_menu_language' ).removeClass( 'active' );

				// remove selected state

				$( this ).removeClass( 'selected' );
			}
			else
			{
				// hide other sub menus

				closeAllSubMenus();

				// show language sub menu

				$( '#sub_menu_language' ).show();
				$( '#sub_menu_language' ).addClass( 'active' );

				// show selected state

				$( this ).addClass( 'selected' );
			}

			// remove focus from input

			$( '#search_input' ).blur();

			// cancel event bubbeling

			cancelEvents( event );
		});
	}
	else
	{
		// hide

		$( '#top_menu_language' ).hide();
	}

	// main button

	if ( globalSettings.showMainMenuButton )
	{
		$( '#top_menu_main' ).click( function( event)
		{
			// is submenu still open

			if ( $( '#sub_menu_main' ).hasClass( 'active' ) )
			{
				// hide main sub menu

				$( '#sub_menu_main' ).hide();
				$( '#sub_menu_main' ).removeClass( 'active' );

				// remove selected state

				$( this ).removeClass( 'selected' );
			}
			else
			{
				// hide other sub menus

				closeAllSubMenus();

				// show main sub menu

				$( '#sub_menu_main' ).show();
				$( '#sub_menu_main' ).addClass( 'active' );

				// show selected state

				$( this ).addClass( 'selected' );
			}

			// remove focus from input

			$( '#search_input' ).blur();

			// cancel event bubbeling

			cancelEvents( event );
		});
	}
	else
	{
		// hide

		$( '#top_menu_main' ).hide();
	}
}

function menuKeyHandler( event )
{
	// ESC Key

	if ( event.keyCode === 27 )
	{
		closeAllSubMenus();
	}
}

function closeAllSubMenus()
{
	// remove selected states

	$( '.top_menu ul li' ).each( function( index )
	{
		$( this ).removeClass( 'selected' );
	});

	// hide all sub menus

	$( '.sub_menu' ).each( function( index )
	{
		if ( $( this ).hasClass( 'active' ) )
		{
	    	$( this ).hide();
	    	$( this ).removeClass( 'active' );
	    }
	});
}

/* ------------------------------------------------------- */
/* Language Submenu Functions                              */
/* ------------------------------------------------------- */

function initializeLanguageSubMenu()
{
	$( '#sub_menu_language_list' ).html( '' );

	var currentLanguage = null;

	// generate dynamic menu items

	for ( var counter = 0; counter < globalSettings.availableLanguages.length; counter++ )
	{
		currentLanguage = globalSettings.availableLanguages[counter];

		// create entry with global texts

		$( '#sub_menu_language_list' ).append( '<li id="' + currentLanguage + '" class="language_sub_menu_button ' + currentLanguage + '"><a href="#"><i class="fal fa-globe fa-fw"></i>' + globalSettings.availableLanguageNames[ currentLanguage ] + ' (' + currentLanguage.toUpperCase() + ')<i class="fal fa-globe fa-fw"></i></a></li>' );
	}

	// bind click handler

	$( '.language_sub_menu_button' ).click( function( event)
	{
		language.setLanguage( $( this ).attr( 'id' ) );

		if ( globalSettings.useLocalStorageLanguage )
		{
			saveCurrentLanguageInLocalStorage( $( this ).attr( 'id' ) );
		}

		window.setTimeout( 'onLanguageChange();', 500 );
	});

	// mark current language in menu

	markCurrentLanguageInMenu();
}

/* ------------------------------------------------------- */
/* Language dependent menu functions                       */
/* ------------------------------------------------------- */

function setLanguageDependentMenuHrefs()
{
	privacytHref = replaceKeyInText( generateAbsoluteUrl( globalSettings.showMainMenuPrivacyHref ), 'language', language.getLanguage() );

	if ( globalSettings.showMainMenuPrivacyOpenMethod == 'window' )
	{
		$( '#sub_menu_main_privacy_title' ).attr( 'href', privacytHref );
	}

	copyrightHref = replaceKeyInText( generateAbsoluteUrl( globalSettings.showMainMenuCopyrightHref ), 'language', language.getLanguage() );

	if ( globalSettings.showMainMenuCopyrightOpenMethod == 'window' )
	{
		$( '#sub_menu_main_copyright_title' ).attr( 'href', copyrightHref );
	}

	imprintHref = replaceKeyInText( generateAbsoluteUrl( globalSettings.showMainMenuImprintHref ), 'language', language.getLanguage() );

	if ( globalSettings.showMainMenuImprintOpenMethod == 'window' )
	{
		$( '#sub_menu_main_imprint_title' ).attr( 'href', imprintHref );
	}
}

/* ------------------------------------------------------- */
/* Main Submenu Functions                                  */
/* ------------------------------------------------------- */

var privacytHref  = null;
var copyrightHref = null;
var imprintHref   = null;

function initializeMainSubMenu()
{
	// help

	if ( globalSettings.showMainMenuHelpButton )
	{
		// bind click handler

		$( '#sub_menu_main_help' ).click( function( event)
		{
			showHelp();
		});
	}
	else
	{
		// hide

		$( '#sub_menu_main_help' ).hide();
	}

	// privacy

	if ( globalSettings.showMainMenuPrivacyButton )
	{
		// generate Href for privacy

		privacytHref = replaceKeyInText( generateAbsoluteUrl( globalSettings.showMainMenuPrivacyHref ), 'language', language.getLanguage() );

		if ( globalSettings.showMainMenuPrivacyOpenMethod == 'overlay' )
		{
			// bind click handler

			$( '#sub_menu_main_privacy' ).click( function( event)
			{
				showContentInOverlay( privacytHref, globalSettings.showMainMenuPrivacyOverlayWidth, globalSettings.showMainMenuPrivacyOverlayHeight );
			});
		}
		else
		{
			// open in new windows via a href

			$( '#sub_menu_main_privacy_title' ).attr( 'href', privacytHref );
			$( '#sub_menu_main_privacy_title' ).attr( 'target', '_blank' );
		}
	}
	else
	{
		// hide

		$( '#sub_menu_main_privacy' ).hide();
	}

	// copyright

	if ( globalSettings.showMainMenuCopyrightButton )
	{
		// generate Href for copyright

		copyrightHref = replaceKeyInText( generateAbsoluteUrl( globalSettings.showMainMenuCopyrightHref ), 'language', language.getLanguage() );

		if ( globalSettings.showMainMenuCopyrightOpenMethod == 'overlay' )
		{
			// bind click handler

			$( '#sub_menu_main_copyright' ).click( function( event)
			{
				showContentInOverlay( copyrightHref, globalSettings.showMainMenuCopyrightOverlayWidth, globalSettings.showMainMenuCopyrightOverlayHeight );
			});
		}
		else
		{
			// open in new windows via a href

			$( '#sub_menu_main_copyright_title' ).attr( 'href', copyrightHref );
			$( '#sub_menu_main_copyright_title' ).attr( 'target', '_blank' );
		}
	}
	else
	{
		// hide

		$( '#sub_menu_main_copyright' ).hide();
	}

	// imprint

	if ( globalSettings.showMainMenuImprintButton )
	{
		// generate Href for imprint

		imprintHref = replaceKeyInText( generateAbsoluteUrl( globalSettings.showMainMenuImprintHref ), 'language', language.getLanguage() );

		if ( globalSettings.showMainMenuImprintOpenMethod == 'overlay' )
		{
			// bind click handler for overlay

			$( '#sub_menu_main_imprint' ).click( function( event)
			{
				showContentInOverlay( imprintHref, globalSettings.showMainMenuImprintOverlayWidth, globalSettings.showMainMenuImprintOverlayHeight );
			});
		}
		else
		{
			// open in new windows via a href

			$( '#sub_menu_main_imprint_title' ).attr( 'href', imprintHref );
			$( '#sub_menu_main_imprint_title' ).attr( 'target', '_blank' );
		}
	}
	else
	{
		// hide

		$( '#sub_menu_main_imprint' ).hide();
	}
}
