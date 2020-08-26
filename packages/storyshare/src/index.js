/**
 * External dependencies
 */
import { forEach } from 'ramda';

/**
 * Internal dependencies
 */
import stores from './stores';
import { registerStore } from './lib';

forEach( registerStore, stores );

export * from './lib/i18n';
