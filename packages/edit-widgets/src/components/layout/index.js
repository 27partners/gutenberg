/**
 * WordPress dependencies
 */
import { Popover } from '@wordpress/components';
import { PluginArea } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import WidgetAreasBlockEditorProvider from '../widget-areas-block-editor-provider';
import Sidebar from '../sidebar';
import Interface from './interface';
import UnsavedChangesWarning from './unsaved-changes-warning';

function Layout( { blockEditorSettings } ) {
	const hasSidebarEnabled = useSelect( ( select ) => {
		return !! select( 'core/interface' ).getActiveComplementaryArea(
			'core/edit-widgets'
		);
	} );
	return (
		<WidgetAreasBlockEditorProvider
			blockEditorSettings={ blockEditorSettings }
		>
			<Interface blockEditorSettings={ blockEditorSettings } />
			<Sidebar />
			<Popover.Slot />
			<PluginArea />
			<UnsavedChangesWarning />
		</WidgetAreasBlockEditorProvider>
	);
}

export default Layout;
