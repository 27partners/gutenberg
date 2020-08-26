/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';
/**
 * External dependencies
 */
import { shallowEqual } from 'react-redux';
import {
	dissocPath,
	filter,
	isEmpty,
	keys,
	map,
	mergeAll,
	mergeRight,
	omit,
	pick,
} from 'ramda';
import { createHigherOrderComponent } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import { I18NContext } from './I18NContext';

const DEFAULT_LANGUAGE = 'default';

// eslint-disable-next-line arrow-body-style
const withI18N = ( metadata ) =>
	createHigherOrderComponent( ( Block ) => {
		class I18NComponent extends Component {
			constructor() {
				super( ...arguments );

				this.state = {
					currentLanguage: DEFAULT_LANGUAGE,
				};
			}

			setAttributes( attributes ) {
				const { currentLanguage } = this.state;
				const {
					attributes: { i18n },
				} = this.props;
				const i18nAttributes = pick(
					I18NComponent.i18nAttributes(),
					attributes
				);

				if (
					currentLanguage !== DEFAULT_LANGUAGE &&
					! isEmpty( i18nAttributes )
				) {
					attributes = mergeRight(
						omit( I18NComponent.i18nAttributes(), attributes ),
						{
							i18n: mergeRight( i18n, {
								[ currentLanguage ]: mergeRight(
									i18n[ currentLanguage ],
									i18nAttributes
								),
							} ),
						}
					);

					// If the stored attributes for this translation are effectively the defaults then omit it
					const currentAttributes =
						attributes.i18n[ currentLanguage ];
					if (
						shallowEqual(
							pick(
								keys( currentAttributes ),
								I18NComponent.defaultAttributes
							),
							currentAttributes
						)
					) {
						attributes = dissocPath(
							[ 'i18n', currentLanguage ],
							attributes
						);
					}
				}

				this.props.setAttributes( attributes );
			}

			getAttributes() {
				const { currentLanguage } = this.state;
				const { attributes } = this.props;

				if ( currentLanguage === DEFAULT_LANGUAGE ) {
					return omit( [ 'i18n' ], attributes );
				}

				return mergeAll( [
					I18NComponent.defaultAttributes,
					omit(
						[ ...I18NComponent.i18nAttributes(), 'i18n' ],
						attributes
					),
					attributes.i18n[ currentLanguage ] || {},
				] );
			}

			switchLanguage( nextLanguage ) {
				this.setState( { currentLanguage: nextLanguage } );
			}

			render() {
				const { currentLanguage } = this.state;
				return (
					<I18NContext.Provider
						value={ {
							currentLanguage,
							switchLanguage: this.switchLanguage.bind( this ),
						} }
					>
						<Block
							{ ...this.props }
							attributes={ this.getAttributes() }
							setAttributes={ this.setAttributes.bind( this ) }
							currentLanguage={ currentLanguage }
						/>
					</I18NContext.Provider>
				);
			}
		}

		I18NComponent.i18nAttributes = () =>
			keys( filter( ( defn ) => defn.i18n, metadata.attributes ) );

		I18NComponent.defaultAttributes = map(
			( attribute ) => attribute.default,
			omit( [ 'i18n' ], metadata.attributes )
		);

		return I18NComponent;
	}, 'withI18N' );

export default withI18N;
