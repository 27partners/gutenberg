/**
 * WordPress dependencies
 */
/**
 * External dependencies
 */
import {
	NavigationContainer,
	useFocusEffect,
	DefaultTheme,
} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {
	InspectorControls,
	SETTINGS_DEFAULTS as defaultSettings,
} from '@wordpress/block-editor';
import { BottomSheet, ColorSettings } from '@wordpress/components';
import { compose, usePreferredColorSchemeStyle } from '@wordpress/compose';
import { withDispatch, withSelect } from '@wordpress/data';
import { useRef, useCallback } from '@wordpress/element';
import { View, Animated, Easing } from 'react-native';
/**
 * Internal dependencies
 */
import styles from './container.native.scss';

const forFade = ( { current } ) => ( {
	cardStyle: {
		opacity: current.progress,
	},
} );

const BottomSheetScreen = ( { children, setHeight } ) => {
	const height = useRef( { maxHeight: 0 } );
	useFocusEffect(
		useCallback( () => {
			if ( height.current.maxHeight !== 0 ) {
				setHeight( height.current.maxHeight );
			}
			return () => {};
		}, [] )
	);

	const onLayout = ( e ) => {
		if ( height.current.maxHeight !== e.nativeEvent.layout.height ) {
			height.current.maxHeight = e.nativeEvent.layout.height;
			setHeight( e.nativeEvent.layout.height );
		}
	};
	return <View onLayout={ onLayout }>{ children }</View>;
};

const Stack = createStackNavigator();

function BottomSheetSettings( {
	editorSidebarOpened,
	closeGeneralSidebar,
	...props
} ) {
	const heightValue = useRef( new Animated.Value( 1 ) ).current;
	const setHeight = ( maxHeight ) => {
		if ( heightValue !== maxHeight ) {
			Animated.timing( heightValue, {
				toValue: maxHeight,
				duration: 300,
				easing: Easing.ease,
			} ).start();
		}
	};

	const MainScreen = useRef( () => (
		<BottomSheetScreen setHeight={ setHeight } name={ 'main' }>
			<InspectorControls.Slot />
		</BottomSheetScreen>
	) );

	const DetailsScreen = useRef( () => (
		<BottomSheetScreen setHeight={ setHeight } name={ 'Color' }>
			<ColorSettings defaultSettings={ defaultSettings } />
		</BottomSheetScreen>
	) );

	const backgroundStyle = usePreferredColorSchemeStyle(
		styles.background,
		styles.backgroundDark
	);

	const MyTheme = {
		...DefaultTheme,
		colors: {
			...DefaultTheme.colors,
			background: backgroundStyle.backgroundColor,
		},
	};
	return (
		<BottomSheet
			isVisible={ editorSidebarOpened }
			onClose={ closeGeneralSidebar }
			hideHeader
			contentStyle={ styles.content }
			adjustToContentHeight
			{ ...props }
		>
			<Animated.View style={ { height: heightValue } }>
				<NavigationContainer theme={ MyTheme }>
					<Stack.Navigator
						screenOptions={ {
							headerShown: false,
							gestureEnabled: false,
						} }
					>
						<Stack.Screen
							options={ {
								cardStyleInterpolator: forFade,
							} }
							name="Settings"
							component={ MainScreen.current }
						/>
						<Stack.Screen
							options={ {
								cardStyleInterpolator: forFade,
							} }
							name="Colors"
							component={ DetailsScreen.current }
						/>
					</Stack.Navigator>
				</NavigationContainer>
			</Animated.View>
		</BottomSheet>
	);
}

export default compose( [
	withSelect( ( select ) => {
		const { isEditorSidebarOpened } = select( 'core/edit-post' );

		return {
			editorSidebarOpened: isEditorSidebarOpened(),
		};
	} ),
	withDispatch( ( dispatch ) => {
		const { closeGeneralSidebar } = dispatch( 'core/edit-post' );

		return {
			closeGeneralSidebar,
		};
	} ),
] )( BottomSheetSettings );
