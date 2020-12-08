function Language()
{
	this.currentLanguageCode = null;

	this.setLanguage = LanguageSetLanguage;
	this.getLanguage = LanguageGetLanguage;
	this.getString   = LanguageGetString;

	this.languages = new Array();

	this.setLanguage( globalSettings.defaultLanguage );
}

function LanguageSetLanguage( newLanguageCode, newOptionalSubDirectory )
{
	if ( ( newLanguageCode == null ) || ( newLanguageCode == '' ) )
	{
		newLanguageCode = globalSettings.defaultLanguage;
	}

	if ( newOptionalSubDirectory == null )
	{
		newOptionalSubDirectory = '';
	}

	newLanguageCode = '' + newLanguageCode.toLowerCase();

	// ist es denn eine "neue" / noch nicht geladene Sprache

	if ( ( this.currentLanguageCode == newLanguageCode ) && ( newOptionalSubDirectory == '' ) )
	{
		// diese Sprache haben wir schon geladen -> wir sind fertig

		return;
	}

	// schauen ob es die Sprache ueberhaupt gibt

	var languageAvailable = false;

	for ( var counter = 0; counter < globalSettings.availableLanguages.length; counter++ )
	{
		if ( '' + globalSettings.availableLanguages[ counter ].toLowerCase() == newLanguageCode )
		{
			languageAvailable = true;

			break;
		}
	}

	if ( ! languageAvailable )
	{
		// unbekannte Sprachen -> Default nehmen

		newLanguageCode = globalSettings.defaultLanguage;
	}

	// nun laden wir die Sprache (abhaengig ob es der Player schon aufgebaut ist oder nicht)

	if ( document.body != null )
	{
		// Seite ist schon komplett aufgebaut

		var scriptObject = document.createElement( 'script' );

		scriptObject.id      = 'languageFile';
		scriptObject.src     = newOptionalSubDirectory + 'language/' + newLanguageCode + '.js';
		scriptObject.charset = 'utf-8';

		document.body.appendChild( scriptObject );
	}
	else
	{
		// Seite befindet sich gerade im Aufbau (z.B.: Initialisierung der Sprache)

		document.write( '<script id="languageFile" type="text/javascript" src="' + newOptionalSubDirectory + 'language/' + newLanguageCode + '.js" charset="utf-8"></scr' + 'ipt>' );
	}

	// und setzen den Code

	this.currentLanguageCode = newLanguageCode;
}

function LanguageGetLanguage()
{
	return ( this.currentLanguageCode );
}

function LanguageGetString( name )
{
	var languageArray = this.languages[this.currentLanguageCode];

	var returnValue = null;

	if ( languageArray != null )
	{
		returnValue = languageArray[name];
	}
	else
	{
		returnValue = 'The currently selected language "' +  this.currentLanguageCode + '" is not available!';
	}

	if ( returnValue == null )
	{
		returnValue = 'The language string with name "' +  name + '" is not available!';
	}

	return ( returnValue );
}

var language = new Language();
