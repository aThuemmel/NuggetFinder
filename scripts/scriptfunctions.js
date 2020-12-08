/* ******************************************************* */
/* Script Functions                                      */
/* ******************************************************* */

// -----------------------------------------------------------
// Base Functions
// -----------------------------------------------------------

function isScriptAvailable( scriptId )
{
	return( $( '#' + scriptId ) != null );
}

function loadScript( scriptId, scriptSource, callbackFunction )
{
	if ( isScriptAvailable( scriptId ) )
	{
		// ist schon geladen => callback rufen

		if ( callbackFunction != null )
		{
			window.setTimeout( callbackFunction, 0 );
		}
	}

	// FIXME SC: absolute / ajax / ...

	var scriptObject = document.createElement( 'script' );

	scriptObject.id      = scriptId;
	scriptObject.src     = scriptSource;
	scriptObject.type    = 'text/javascript';
	scriptObject.charset = 'utf-8';

	if ( callbackFunction != null )
	{
		scriptObject.onload = callbackFunction;
	}

	document.body.appendChild( scriptObject );
}

function unloadScript( scriptId )
{
	if ( $( '#' + scriptId ) != null )
	{
		document.body.removeChild( $( '#' + scriptId ) );
	}
}

// -----------------------------------------------------------
// Preload Functions
// -----------------------------------------------------------

function preloadScripts( scriptObjectsToLoad, callbackFunction )
{
	if ( ! scriptObjectsToLoad.length )
	{
		callbackFunction && callbackFunction();
	}
	else
	{
		for ( var loaderQueue = [], counter = scriptObjectsToLoad.length; counter--; )
		{
			var scriptObject = document.createElement( 'script' );

			scriptObject.id      = scriptObjectsToLoad[counter].scriptId;
			scriptObject.src     = scriptObjectsToLoad[counter].scriptSource;
			scriptObject.type    = 'text/javascript';
			scriptObject.charset = 'utf-8';

			if ( callbackFunction )
			{
				loaderQueue.push( scriptObject );

				scriptObject.onload = checkLoaderQueue;

				// falls keine Fehlerausgaben gewuenscht

				// scriptObject.onerror = checkLoaderQueue;

				// falls Fehlerausgabe gewuenscht

				scriptObject.onerror = onPreloadScriptError;
			}

			// Element hinzufuegen

			document.body.appendChild( scriptObject );
		}
	}

	function checkLoaderQueue()
	{
		if ( ( this.readyState === undefined ) || ( this.readyState === 'complete' ) )
		{
			for ( var counter = loaderQueue.length; counter--; )
			{
				if ( loaderQueue[counter] == this )
				{
					loaderQueue.splice( counter, 1 );
				}
			}

			if ( ! loaderQueue.length )
			{
				callbackFunction();
			}
		}
	}

	function onPreloadScriptError()
	{
		for ( var counter = loaderQueue.length; counter--; )
		{
			if ( loaderQueue[counter] == this )
			{
				loaderQueue.splice( counter, 1 );
			}
		}

		if ( ! loaderQueue.length )
		{
			callbackFunction();
		}
	}
}