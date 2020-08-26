/**
 * WordPress dependencies
 */
import { Component, Fragment } from '@wordpress/element';
/**
 * External dependencies
 */
import { mapObjIndexed, values } from 'ramda';
import { __ } from '@wordpress/i18n';
import {
	DropdownMenu,
	MenuGroup,
	MenuItem,
	Toolbar,
} from '@wordpress/components';
import { withSelect } from '@wordpress/data';
/**
 * Internal dependencies
 */
import { I18NContext } from './I18NContext';

class I18NToolbar extends Component {
	renderMenuItems( onClose ) {
		return values(
			mapObjIndexed(
				( title, lang ) => (
					<MenuItem
						icon={
							this.context.currentLanguage === lang ? 'yes' : null
						}
						onClick={ () => {
							onClose();
							this.context.switchLanguage( lang );
						} }
					>
						{ title }
					</MenuItem>
				),
				this.props.languages
			)
		);
	}

	render() {
		return (
			<Toolbar>
				<DropdownMenu
					icon="translation"
					label={ __( 'Translation' ) }
					hasArrowIndicator
				>
					{ ( { onClose } ) => (
						<Fragment>
							<MenuGroup>
								{ this.renderMenuItems( onClose ) }
							</MenuGroup>
						</Fragment>
					) }
				</DropdownMenu>
			</Toolbar>
		);
	}
}

I18NToolbar.contextType = I18NContext;

export const mapSelectToProps = ( select ) => {
	const i18n = select( 'i18n' );

	return {
		languages: i18n.getLanguages(),
	};
};

export default withSelect( mapSelectToProps )( I18NToolbar );
