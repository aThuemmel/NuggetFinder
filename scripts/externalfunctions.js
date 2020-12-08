/* ******************************************************* */
/* External Functions                                      */
/* ******************************************************* */

var communicationAvailable = null;

/* ------------------------------------------------------- */
/* Check Communication                                     */
/* ------------------------------------------------------- */

function checkExternalCommunicationAvailable()
{
	if ( communicationAvailable == null )
	{
		communicationAvailable = doCheckExternalCommunicationAvailable();
	}

	return ( communicationAvailable );
}

function doCheckExternalCommunicationAvailable()
{
	if ( ( window != undefined ) &&
         ( window.external != undefined ) )
    {
       return ( true );
    }

    return ( false );
}

/* ------------------------------------------------------- */
/* .Net 2 JavaScript Communication                         */
/* ------------------------------------------------------- */

function setUserInformation( userNameFromDotNet, userImageHrefFromDotNet )
{
	if ( userNameFromDotNet != null )
	{
		setUserName( userNameFromDotNet );
	}

	if ( userImageHrefFromDotNet )
	{
		setUserImage( userImageHrefFromDotNet );
	}
}

function setContextInformation( contextObjectFromDotNet )
{
	if ( contextObjectFromDotNet != null )
	{
		setContextObject( contextObjectFromDotNet );
	}
}

/* ------------------------------------------------------- */
/* JavaScript 2 .Net Communication                         */
/* ------------------------------------------------------- */

function openExternalContentById( externalContentId )
{
	if ( checkExternalCommunicationAvailable() )
	{
		try
		{
			window.external.openExternalContentById( externalContentId );
		}
		catch( e )
		{
			showErrorMessage( language.getString( 'external_service_communication_error' ) );
		}
	}
	else
	{
		showErrorMessage( language.getString( 'external_service_not_available' ) );
	}
}

function openExternalContentByHref( externalContentHref )
{
	if ( checkExternalCommunicationAvailable() )
	{
		try
		{
			window.external.openExternalContentByHref( externalContentHref );
		}
		catch( e )
		{
			showErrorMessage( language.getString( 'external_service_communication_error' ) );
		}
	}
	else
	{
		showErrorMessage( language.getString( 'external_service_not_available' ) );
	}
}
