/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';

const FETCH_LANGUAGES = 'FETCH_LANGUAGES';
const SET_LANGUAGES = 'SET_LANGUAGES';

const actions = {
	setLanguages( languages ) {
		return {
			type: SET_LANGUAGES,
			langs: languages,
		};
	},

	fetch() {
		return {
			type: FETCH_LANGUAGES,
		};
	},
};

export default {
	name: 'i18n',

	reducer: ( state = {}, action ) => {
		switch ( action.type ) {
			case SET_LANGUAGES:
				return {
					...state,
					langs: action.langs,
				};
		}

		return state;
	},

	actions,

	selectors: {
		getLanguages( state ) {
			return state.langs;
		},
	},

	initialState: {
		langs: {},
	},

	controls: {
		FETCH_LANGUAGES() {
			return apiFetch( { path: '/storyshare/v1/i18n/languages' } );
		},
	},

	resolvers: {
		*getLanguages() {
			const languages = yield actions.fetch();
			return actions.setLanguages( languages );
		},
	},
};
