/**
 * WordPress dependencies
 */
import { registerStore } from '@wordpress/data';
/**
 * External dependencies
 */
import { omit } from 'ramda';

export default ( definition ) => {
	registerStore( definition.name, omit( 'name', definition ) );
};
