/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { file as icon } from '@wordpress/icons';
import { withI18N } from '@wordpress/storyshare';

/**
 * Internal dependencies
 */
import edit from './edit';
import metadata from './block.json';
import save from './save';
import transforms from './transforms';

const { name } = metadata;

export { metadata, name };

export const settings = {
	title: __( 'File' ),
	description: __( 'Add a link to a downloadable file.' ),
	icon,
	keywords: [ __( 'document' ), __( 'pdf' ), __( 'download' ) ],
	transforms,
	edit: withI18N( metadata )( edit ),
	save,
};
