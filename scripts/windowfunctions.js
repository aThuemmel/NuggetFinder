/* ******************************************************* */
/* Window Functions                                        */
/* ******************************************************* */

function openBrowserWindow( resourceHref, resourceWin, width, height, opener, fullscreen )
{
	fullscreen = ( ( '' + fullscreen ) == 'true' );

	var windowAttributes = globalSettings.windowAttributes;

	if ( windowAttributes == '' )
	{
		windowAttributes = 'location=no,menubar=no,toolbar=no,scrollbars=yes,status=no,resizable=yes';
	}

	if ( fullscreen )
	{
		windowAttributes += ',fullscreen=1';
	}

	var globalWidth  = null;
	var globalHeight = null;

	// Breite berechnen

	globalWidth  = parseInt( width,  10 );

	if ( isNaN( globalWidth ) )
	{
		var desiredWidth = Math.min( 1024, screen.availWidth );
	}
	else
	{
		var desiredWidth = Math.min( globalWidth,  screen.availWidth );
	}

	// Hoehe berechnen

	var globalHeight  = parseInt( height,  10 );

	if ( isNaN( globalHeight ) )
	{
		var desiredHeight = Math.min( 740, screen.availHeight );
	}
	else
	{
		var desiredHeight = Math.min( globalHeight, screen.availHeight );
	}

	// Startkoordinaten berechnen

	var left = ( screen.availWidth  / 2 ) - ( desiredWidth  / 2 );
	var top  = ( screen.availHeight / 2 ) - ( desiredHeight / 2 );

	// Fenster oeffnen

	var openedWindow = opener.open( resourceHref, resourceWin, windowAttributes );

	if ( ( globalSettings.windowShowPopupBlockerMessage ) && ( ( openedWindow == null ) || ( openedWindow.closed == true ) ) )
	{
		showErrorMessage( language.getString( 'popup_blocker1' ) + '\n\n' + language.getString( 'popup_blocker2' ) );
		return ( null );
	}

	// Fenster resizen und verschieben

	try
	{
		if ( ! fullscreen )
		{
			openedWindow.resizeTo( desiredWidth, desiredHeight );
			openedWindow.moveTo( left, top );
		}

		openedWindow.focus();
	}
	catch( e )
	{
		// could be ignored
	}

	return ( openedWindow );
}
