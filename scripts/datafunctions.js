/* ******************************************************* */
/* Datafunctions                                           */
/* ******************************************************* */

/* ------------------------------------------------------- */
/* Constants and Variables                                 */
/* ------------------------------------------------------- */

// BasePath

var documentBase = null;

// Application

var allApplicationsArray = [];
var applicationsToShow   = [];
var applicationId        = null;

// Autocomplete

var allSuggestionsArray = [];
var suggestionsArray    = [];

// Search

var searchPattern = '';

// Content

var allContentElements                = [];
var contentElementsToSearch           = [];
var additionalContentElementsToSearch = [];
var contentElementsToShow             = [];
var additionalContentElementsToShow   = [];

// Nuggets

var nuggetBasePath  = null;
var nuggetPlayerUrl = null;
var currentNuggetContainer = null;

/* ------------------------------------------------------- */
/* DocumentBase                                            */
/* ------------------------------------------------------- */

function getDocumentBase()
{
	if ( documentBase == null )
	{
		documentBase = document.location.href.substring( 0, document.location.href.lastIndexOf( '/' ) + 1 );
	}

	return ( documentBase );
}

/* ------------------------------------------------------- */
/* Application functions                                   */
/* ------------------------------------------------------- */

function getAllApplicationsArray()
{
	return( allApplicationsArray );
}

function setApplicationsToShow( languageToShow )
{
	applicationsToShow = allApplicationsArray[ languageToShow ];

	if ( applicationsToShow == null)
	{
		applicationsToShow = [];
	}

	// do we have to sort?

	if ( ( globalSettings.applicationSortByTitle ) &&
	     ( applicationsToShow.length > 0 ) &&
	     ( applicationsToShow[0].id !== globalSettings.applicationAllId ) )
	{
		applicationsToShow.sort( ApplicationComparator );
	}

	// do we have to insert a all element?

	if ( ( globalSettings.applicationGenerateAll ) &&
	     ( applicationsToShow.length > 0 ) &&
	     ( applicationsToShow[0].id !== globalSettings.applicationAllId ) )
	{
		// generate all content and suggestion array

		var generatedAllSuggestionsArray     = [];
		var generatedAllContentElementsArray = [];

		for ( var counter = 0; counter < applicationsToShow.length; counter++ )
		{
			generatedAllSuggestionsArray = generatedAllSuggestionsArray.concat( allSuggestionsArray[languageToShow + '_' + applicationsToShow[counter].id] );

			generatedAllContentElementsArray = generatedAllContentElementsArray.concat( allContentElements[languageToShow + '_' + applicationsToShow[counter].id] );
		}

		// insert all element to applications

		applicationsToShow.unshift( {
			'id': globalSettings.applicationAllId,
			'title': language.getString( globalSettings.applicationAllTitleId ),
			'version': globalSettings.applicationAllVersion,
			'classNames': globalSettings.applicationAllClassNames,
			'contentUrl': '',
			'suggestionUrl': '',
			'nuggetPlayerUrl': globalSettings.applicationAllNuggetPlayerUrl + languageToShow
		} );

		// insert all content and suggestion arrays

		allSuggestionsArray[languageToShow + '_' + globalSettings.applicationAllId] = generatedAllSuggestionsArray;

		allContentElements[languageToShow + '_' + globalSettings.applicationAllId] = generatedAllContentElementsArray;
	}
}

function getApplicationsToShow()
{
	if ( applicationsToShow == null )
	{
		applicationsToShow = [];
	}

	return ( applicationsToShow );
}

function setApplicationId( newApplicationId )
{
	applicationId = newApplicationId;

	if ( applicationId != null )
	{
		currentLanguage = language.getLanguage();

		// suggestions setzen

		setSuggestionsArray( allSuggestionsArray[currentLanguage + '_' + applicationId] );

		// set Content Elements To Search

		setContentElementsToSearch( allContentElements[currentLanguage + '_' + applicationId] );

		// create Additional Content Elements To Search

		createAdditionalContentElementsToSearch( currentLanguage, applicationId );
	}
	else
	{
		// reset Elements

		setSuggestionsArray( [] );
		setContentElementsToSearch( [] );
		setAdditionalContentElementsToSearch( [] );
	}

	nuggetPlayerUrl = null;
}

function getApplicationId()
{
	return ( applicationId );
}

function getClassNamesForApplication( applicationId, applicationFallbackId )
{
	if ( ( applicationId == null ) || ( applicationId == '' ) )
	{
		applicationId = applicationFallbackId;
	}

	var currentClassNames = 'fa fa-question fa-fw';

	var currentApplicationsToShow = getApplicationsToShow();

	for ( var counter = 0; counter < currentApplicationsToShow.length; counter++ )
	{
		if ( currentApplicationsToShow[counter].id == applicationId )
		{
			currentClassNames = currentApplicationsToShow[counter].classNames;
			break;
		}
	}

	return ( currentClassNames );
}

function isApplicationAvailableForCurrentLanguage( applicationId )
{
	var returnValue = false;

	var currentApplicationsToShow = getApplicationsToShow();

	for ( var counter = 0; counter < currentApplicationsToShow.length; counter++ )
	{
		if ( currentApplicationsToShow[counter].id == applicationId )
		{
			returnValue = true;
			break;
		}
	}

	return ( returnValue );
}

/* ------------------------------------------------------- */
/* Autocomplete functions                                  */
/* ------------------------------------------------------- */

function setSuggestionsArray( newSuggestionsArray )
{
	suggestionsArray = newSuggestionsArray;

	// autocomplete updaten

	window.setTimeout( 'autocompleteUpdateLookup();', 10 );
}

function getSuggestionsArray()
{
	return ( suggestionsArray );
}

/* ------------------------------------------------------- */
/* Search functions                                        */
/* ------------------------------------------------------- */

function setSearchPattern( newSearchPattern )
{
	searchPattern = newSearchPattern;
}

function getSearchPattern()
{
	return ( searchPattern );
}

/* ------------------------------------------------------- */
/* Content functions                                       */
/* ------------------------------------------------------- */

function setContentElementsToSearch( newContentElementsToSearch )
{
	if ( newContentElementsToSearch != null )
	{
		contentElementsToSearch = newContentElementsToSearch;
	}
}

function getContentElementsToSearch()
{
	return ( contentElementsToSearch );
}

function createAdditionalContentElementsToSearch( currentLanguage, currentApplicationId )
{
	if ( currentApplicationId == globalSettings.applicationAllId )
	{
		// ok, we're done

		return ( [] );
	}

	additionalContentElementsToSearch = []

	var applicationArray = allApplicationsArray[ currentLanguage ];

	for ( var counter = 0; counter < applicationArray.length; counter++ )
	{
		if ( ( applicationArray[counter].id == globalSettings.applicationAllId ) || ( applicationArray[counter].id == currentApplicationId ) )
		{
			// neither all nor current application array should be in additional search

			continue;
		}

		if ( allContentElements[ currentLanguage + '_' + applicationArray[counter].id ] != null )
		{
			additionalContentElementsToSearch = additionalContentElementsToSearch.concat( allContentElements[ currentLanguage + '_' + applicationArray[counter].id ] );
		}
	}
}

function setAdditionalContentElementsToSearch( newAdditionalContentElementsToSearch )
{
	if ( newAdditionalContentElementsToSearch != null )
	{
		additionalContentElementsToSearch = newAdditionalContentElementsToSearch;
	}
}

function getAdditionalContentElementsToSearch()
{
	return ( additionalContentElementsToSearch );
}

function setContentElementsToShow( newContentElementsToShow, newAdditionalContentElementsToShow )
{
	if ( newContentElementsToShow != null )
	{
		contentElementsToShow = newContentElementsToShow;

		// gab es auch Additional content Elements

		if ( newAdditionalContentElementsToShow != null )
		{
			additionalContentElementsToShow = newAdditionalContentElementsToShow;
		}
		else
		{
			additionalContentElementsToShow = [];
		}

		setTimeout( 'showContentElements();', 0 );
	}
}

function getContentElementsToShow()
{
	return ( contentElementsToShow );
}

function getAdditionalContentElementsToShow()
{
	return ( additionalContentElementsToShow );
}

/* ------------------------------------------------------- */
/* Nugget Functions                                        */
/* ------------------------------------------------------- */

function getNuggetBasePath()
{
	if ( nuggetBasePath == null )
	{
		if ( globalSettings.nuggetLocation == 'relative' )
		{
			nuggetBasePath = getDocumentBase() + globalSettings.nuggetRelativeBasePath;
		}
		else if ( globalSettings.nuggetLocation == 'absolute' )
		{
			nuggetBasePath = globalSettings.nuggetAbsoluteBasePath;
		}
		else
		{
			showErrorMessage( language.getString( 'unknown_configuration_value' ) + 'globalSettings.nuggetLocation' );
		}
	}

	return ( nuggetBasePath );
}

function getNuggetPlayerUrl()
{
	if ( nuggetPlayerUrl == null )
	{
		for ( var counter = 0; counter < applicationsToShow.length; counter++ )
		{
			if ( applicationsToShow[ counter ].id == applicationId )
			{
				nuggetPlayerUrl = applicationsToShow[ counter ].nuggetPlayerUrl;
				break;
			}
		}
	}

	return ( nuggetPlayerUrl );
}

function getNuggetById(uuid) {

	// get nugget

	var currentNugget = null;
	var position = 0;
	var additionalResult = false;

	$.each(getContentElementsToShow(), function( index, currentElement )
	{
		position++;

		if ( uuid == currentElement.uuid )
		{
			currentNugget = currentElement;

			return false;
		}
	});

	if ( ! currentNugget )
	{
		$.each( getAdditionalContentElementsToShow(), function( index, currentElement )
		{
			position++;

			if ( uuid == currentElement.uuid )
			{
				additionalResult = true;
				currentNugget = currentElement;

				return false;
			}
		});
	}

	return ( currentNugget
		? {	nugget: currentNugget,
			position: position,
			inAdditionalResult: additionalResult}
		: null );
}

function setCurrentNuggetContainer( nuggetContainer )
{
	if ( nuggetContainer && nuggetContainer.nugget )
	{
		currentNuggetContainer = nuggetContainer;
	}
}

function getCurrentNuggetContainer()
{
	return ( currentNuggetContainer );
}