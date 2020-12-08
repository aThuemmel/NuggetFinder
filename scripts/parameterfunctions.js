var IGNORE_CASE = true;

var param = new Array();

function getParam( p, d )
{
	if ( param[prepareKey( p )] == null )
	{
		return ( d );
	}
	else
	{
		return ( param[prepareKey( p )] );
	}
}

function prepareKey( p )
{
	return ( IGNORE_CASE ? p.toLowerCase() : p );
}

function getAlterParam()
{
	var temp;

	for ( var i = 0 ; i < getAlterParam.arguments.length ; i++ )
	{
		temp = getParam( getAlterParam.arguments[i] );

		if ( temp != null )
		{
			return ( temp );
		}
	}

	return ( null );
}

function analyseURL( theURL )
{
	splitParams( theURL.substring( 1 ) );
}

function splitParams( theParams )
{
	if ( location.protocol.toLowerCase().indexOf( 'file' ) == 0 )
	{
		theParams = theParams.replace( /%26/, '&' );
	}

	var i = theParams.indexOf( '&' );

	if ( i >= 0 )
	{
		addParam( theParams.substring( 0, i ) );
		splitParams( theParams.substring( i + 1 ) );
	}
	else
	{
		addParam( theParams );
	}
}

function addParam( p )
{
	var i = p.indexOf( '=' );

	if ( i > 0 )
	{
		param[prepareKey( p.substring( 0, i ) )] = decodeURI( p.substring( i + 1 ) );
	}
	else
	{
		param[prepareKey( p )] = '';
	}
}

analyseURL( self.location.search );
