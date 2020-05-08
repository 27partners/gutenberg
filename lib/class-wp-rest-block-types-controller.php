<?php
/**
 * REST API: WP_REST_Block_Types_Controller class
 *
 * @since      5.4.0
 * @subpackage REST_API
 * @package    WordPress
 */

/**
 * Core class used to access block types via the REST API.
 *
 * @see   WP_REST_Controller
 */
class WP_REST_Block_Types_Controller extends WP_REST_Controller {

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->namespace = '__experimental';
		$this->rest_base = 'block-types';
	}

	/**
	 * Registers the routes for the objects of the controller.
	 *
	 * @see   register_rest_route()
	 */
	public function register_routes() {

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_items' ),
					'permission_callback' => array( $this, 'get_items_permissions_check' ),
					'args'                => $this->get_collection_params(),
				),
				'schema' => array( $this, 'get_public_item_schema' ),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<namespace>[a-zA-Z0-9_-]+)/(?P<name>[a-zA-Z0-9_-]+)',
			array(
				'args'   => array(
					'name'      => array(
						'description' => __( 'Block name', 'gutenberg' ),
						'type'        => 'string',
					),
					'namespace' => array(
						'description' => __( 'Block namespace', 'gutenberg' ),
						'type'        => 'string',
					),
				),
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_item' ),
					'permission_callback' => array( $this, 'get_item_permissions_check' ),
					'args'                => array(
						'context' => $this->get_context_param( array( 'default' => 'view' ) ),
					),
				),
				'schema' => array( $this, 'get_public_item_schema' ),
			)
		);
	}

	/**
	 * Checks whether a given request has permission to read post block types.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 *
	 * @return WP_Error|bool True if the request has read access, WP_Error object otherwise.
	 */
	public function get_items_permissions_check( $request ) { // phpcs:ignore VariableAnalysis.CodeAnalysis.VariableAnalysis.UnusedVariable
		if ( ! current_user_can( 'edit_posts' ) ) {
			return new WP_Error( 'rest_cannot_view', __( 'Sorry, you are not allowed to manage block types.', 'gutenberg' ), array( 'status' => rest_authorization_required_code() ) );
		}

		return true;
	}

	/**
	 * Retrieves all post block types, depending on user context.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 *
	 * @return WP_Error|WP_REST_Response Response object on success, or WP_Error object on failure.
	 */
	public function get_items( $request ) {
		$data        = array();
		$block_types = WP_Block_Type_Registry::get_instance()->get_all_registered();

		// Retrieve the list of registered collection query parameters.
		$registered = $this->get_collection_params();
		$namespace  = '';
		if ( isset( $registered['namespace'] ) && ! empty( $request['namespace'] ) ) {
			$namespace = $request['namespace'];
		}

		foreach ( $block_types as $slug => $obj ) {
			$ret = $this->check_read_permission();

			if ( ! $ret ) {
				continue;
			}

			$block_type = $this->prepare_item_for_response( $obj, $request );

			if ( $namespace ) {
				$pieces          = explode( '/', $obj->name );
				$block_namespace = $pieces[0];
				if ( $namespace !== $block_namespace ) {
					continue;
				}
			}

			$data[ $obj->name ] = $this->prepare_response_for_collection( $block_type );
		}

		return rest_ensure_response( $data );
	}

	/**
	 * Checks if a given request has access to read a block type.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 *
	 * @return WP_Error|bool True if the request has read access for the item, WP_Error object otherwise.
	 */
	public function get_item_permissions_check( $request ) {
		$block_name = $request['namespace'] . '/' . $request['name'];
		$block_type = WP_Block_Type_Registry::get_instance()->get_registered( $block_name );

		if ( empty( $block_type ) ) {
			return new WP_Error( 'rest_block_type_invalid', __( 'Invalid block type.', 'gutenberg' ), array( 'status' => 404 ) );
		}

		$check = $this->check_read_permission();

		if ( ! $check ) {
			return new WP_Error( 'rest_cannot_read_block_type', __( 'Cannot view block type.', 'gutenberg' ), array( 'status' => rest_authorization_required_code() ) );
		}

		return true;
	}

	/**
	 * Checks whether a given block type should be visible.
	 *
	 * @return WP_Error|bool True if the block type is visible, otherwise false.
	 */
	protected function check_read_permission() {
		if ( ! current_user_can( 'edit_posts' ) ) {
			return new WP_Error( 'rest_cannot_view', __( 'Sorry, you are not allowed to manage block types.', 'gutenberg' ), array( 'status' => rest_authorization_required_code() ) );
		}

		return true;
	}

	/**
	 * Retrieves a specific block type.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 *
	 * @return WP_Error|WP_REST_Response Response object on success, or WP_Error object on failure.
	 */
	public function get_item( $request ) {
		$block_name = $request['namespace'] . '/' . $request['name'];
		$block_type = WP_Block_Type_Registry::get_instance()->get_registered( $block_name );

		if ( empty( $block_type ) ) {
			return new WP_Error( 'rest_block_type_invalid', __( 'Invalid block type.', 'gutenberg' ), array( 'status' => 404 ) );
		}

		$data = $this->prepare_item_for_response( $block_type, $request );

		return rest_ensure_response( $data );
	}

	/**
	 * Prepares a block type object for serialization.
	 *
	 * @param stdClass        $block_type block type data.
	 * @param WP_REST_Request $request    Full details about the request.
	 *
	 * @return WP_REST_Response block type data.
	 */
	public function prepare_item_for_response( $block_type, $request ) {

		$fields = $this->get_fields_for_response( $request );
		$data   = array();
		if ( in_array( 'name', $fields, true ) ) {
			$data['name'] = $block_type->name;
		}

		if ( in_array( 'attributes', $fields, true ) ) {
			$data['attributes'] = $block_type->get_attributes();
		}

		if ( in_array( 'is_dynamic', $fields, true ) ) {
			$data['is_dynamic'] = $block_type->is_dynamic();
		}

		$extra_fields = array( 'editor_script', 'script', 'editor_style', 'style' );
		foreach ( $extra_fields as $extra_field ) {
			if ( in_array( $extra_field, $fields, true ) ) {
				$data[ $extra_field ] = (string) $block_type->$extra_field;
			}
		}

		$context = ! empty( $request['context'] ) ? $request['context'] : 'view';
		$data    = $this->add_additional_fields_to_object( $data, $request );
		$data    = $this->filter_response_by_context( $data, $context );

		$response = rest_ensure_response( $data );

		$response->add_links(
			array(
				'collection'              => array(
					'href' => rest_url( sprintf( '%s/%s', $this->namespace, $this->rest_base ) ),
				),
				'https://api.w.org/items' => array(
					'href' => rest_url( sprintf( '%s/%s/%s', $this->namespace, $this->rest_base, $block_type->name ) ),
				),
			)
		);

		/**
		 * Filters a block type returned from the REST API.
		 *
		 * Allows modification of the block type data right before it is returned.
		 *
		 * @param WP_REST_Response $response   The response object.
		 * @param object           $block_type The original block type object.
		 * @param WP_REST_Request  $request    Request used to generate the response.
		 */
		return apply_filters( 'rest_prepare_block_type', $response, $block_type, $request );
	}

	/**
	 * Retrieves the block type' schema, conforming to JSON Schema.
	 *
	 * @return array Item schema data.
	 */
	public function get_item_schema() {
		if ( $this->schema ) {
			return $this->add_additional_fields_schema( $this->schema );
		}

		$schema = array(
			'$schema'    => 'http://json-schema.org/draft-04/schema#',
			'title'      => 'block-type',
			'type'       => 'object',
			'properties' => array(
				'name'          => array(
					'description' => __( 'Unique name identifying the block type.', 'gutenberg' ),
					'type'        => 'string',
					'context'     => array( 'embed', 'view', 'edit' ),
					'readonly'    => true,
				),
				'attributes'    => array(
					'description' => __( 'Block attributes.', 'gutenberg' ),
					'type'        => 'object',
					'context'     => array( 'embed', 'view', 'edit' ),
					'readonly'    => true,
				),
				'is_dynamic'    => array(
					'description' => __( 'Is the block dynamically rendered.', 'gutenberg' ),
					'type'        => 'boolean',
					'context'     => array( 'embed', 'view', 'edit' ),
					'readonly'    => true,
				),
				'editor_script' => array(
					'description' => __( 'Editor script handle.', 'gutenberg' ),
					'type'        => 'string',
					'context'     => array( 'embed', 'view', 'edit' ),
					'readonly'    => true,
				),
				'script'        => array(
					'description' => __( 'URL of script js file.', 'gutenberg' ),
					'type'        => 'string',
					'context'     => array( 'embed', 'view', 'edit' ),
					'readonly'    => true,
				),
				'editor_style'  => array(
					'description' => __( 'URL of editor style css file.', 'gutenberg' ),
					'type'        => 'string',
					'context'     => array( 'embed', 'view', 'edit' ),
					'readonly'    => true,
				),
				'style'         => array(
					'description' => __( 'URL of style css file.', 'gutenberg' ),
					'type'        => 'string',
					'context'     => array( 'embed', 'view', 'edit' ),
					'readonly'    => true,
				),
			),
		);

		$this->schema = $schema;

		return $this->add_additional_fields_schema( $this->schema );
	}

	/**
	 * Retrieves the query params for collections.
	 *
	 * @return array Collection parameters.
	 */
	public function get_collection_params() {
		$new_params              = array();
		$new_params['context']   = $this->get_context_param( array( 'default' => 'view' ) );
		$new_params['namespace'] = array(
			'description' => __( 'Block namespace.', 'gutenberg' ),
			'type'        => 'string',
		);
		return $new_params;
	}

}
