/* ****************************************************** */
/* Know How Hilfsfunktionen                               */
/* ****************************************************** */

var documentBase = document.location.href;

if ( documentBase.indexOf('?') > -1 )
{
	documentBase = documentBase.substring( 0, documentBase.indexOf('?') );
}

documentBase = documentBase.substring( 0, documentBase.lastIndexOf('/') + 1 );

function getDocumentBase()
{
	return ( documentBase );
}

function generateAbsoluteUrl( contentUrl, optionalSubBaseUrl )
{
	if ( ( contentUrl == null ) || ( contentUrl.length == 0 ) )
	{
		alert( 'Content-URL may not be null or empty' );

		return;
	}

	// sind wir relativ oder absolute

	if (  ! ( ( /^http:/i.test( contentUrl ) ) ||
	          ( /^https:/i.test( contentUrl ) ) ||
	          ( /^file:/i.test( contentUrl ) ) ) )
	{
		// wir sind relative -> Pfad zusammensetzen

		if ( optionalSubBaseUrl == null )
		{
			optionalSubBaseUrl = '';
		}

		if (  ! ( ( /^http:/i.test( optionalSubBaseUrl ) ) ||
	            ( /^https:/i.test( optionalSubBaseUrl ) ) ||
	            ( /^file:/i.test( optionalSubBaseUrl ) ) ) )
		{
			// Zusammenbauen aus allen 3 Bestandteilen

			return ( documentBase + optionalSubBaseUrl + contentUrl );
		}
		else
		{
			// Hier ist die optionalSubBaseUrl schon absolut => also kein documentBase hinzufuegen

			return ( optionalSubBaseUrl + contentUrl );
		}
	}
	else
	{
		// wir sind schon absolut -> einfach zurueck geben

		return ( contentUrl );
	}
}

function replaceKeyInText( text, key, value )
{
	if ( ( key != null ) && ( value != null ) )
	{
		var expression = new RegExp( '{' + key + '}', 'g' );
		text = text.replace( expression, value );
	}

	return (text );
}

function findClosestElementTopByClassNameAndPreferedTopValue( elementClass, preferedTopValue )
{
	var closestElementTop = 0;

	var currentTop        = 0;

	var closestDifference = 10000;
	var currentDifference = 0;

	$( '.' + elementClass ).each( function( i )
	{
		currentTop = parseInt( $( this ).offset().top, 0 );
		currentDifference = Math.abs( preferedTopValue - currentTop );

		if ( currentDifference < closestDifference )
		{
			closestDifference = currentDifference;
			closestElementTop = currentTop;
		}
		else
		{
			// der Abstand wiird wieder groesser => abbrechen

			return false;
		}
	});

	return ( closestElementTop );
}

function isMobileDevice()
{
    return ( ( typeof window.orientation !== 'undefined' ) || ( navigator.userAgent.indexOf( 'IEMobile' ) !== -1 ) );
};

// Sort Algorithms

function ApplicationComparator( firstObject, secondObject )
{
	return ( BasicSortAlgorithm( firstObject, secondObject, 'title', true ) );
}

function HitCountComparator( firstObject, secondObject )
{
	return ( BasicSortAlgorithm( firstObject, secondObject, 'hitCount', false ) );
}

function BasicSortAlgorithm( firstObject, secondObject, fieldName, orderAscending )
{
	var	sortOrder = null;

	if ( orderAscending )
	{
		sortOrder = -1;
	}
	else
	{
		sortOrder = 1;
	}

	if ( firstObject[fieldName] < secondObject[fieldName] )
	{
		return ( sortOrder );
	}

	if ( firstObject[fieldName] > secondObject[fieldName] )
	{
		return ( -sortOrder );
	}

	return ( 0 );
}

// Sort Case Insensitiv

function SortCaseInsensitive( a, b )
{
	if ( a.toLowerCase() == b.toLowerCase() )
	{
		return ( 0 );
	}
	else
	{
		return ( a.toLowerCase() < b.toLowerCase() ) ? -1 : 1;
	}
}

// Sort Case Sensitiv

function SortCaseSensitive( a, b )
{
	if ( a == b )
	{
		return ( 0 );
	}
	else
	{
		return ( a < b ) ? -1 : 1;
	}
}

// Sort By length

function SortByLengthAsc( a, b )
{
	return ( a.length - b.length );
}

function SortByLengthDesc( a, b )
{
	return ( b.length - a.length );
}