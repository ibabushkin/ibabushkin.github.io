initSidebarItems({"constant":[["ADD_OUTPUT_MODE",""],["BAD_CRTC",""],["BAD_MODE",""],["BAD_OUTPUT",""],["BAD_PROVIDER",""],["CHANGE_OUTPUT_PROPERTY",""],["CHANGE_PROVIDER_PROPERTY",""],["CONFIGURE_OUTPUT_PROPERTY",""],["CONFIGURE_PROVIDER_PROPERTY",""],["CONNECTION_CONNECTED",""],["CONNECTION_DISCONNECTED",""],["CONNECTION_UNKNOWN",""],["CREATE_MODE",""],["DELETE_OUTPUT_MODE",""],["DELETE_OUTPUT_PROPERTY",""],["DELETE_PROVIDER_PROPERTY",""],["DESTROY_MODE",""],["GET_CRTC_GAMMA",""],["GET_CRTC_GAMMA_SIZE",""],["GET_CRTC_INFO",""],["GET_CRTC_TRANSFORM",""],["GET_OUTPUT_INFO",""],["GET_OUTPUT_PRIMARY",""],["GET_OUTPUT_PROPERTY",""],["GET_PANNING",""],["GET_PROVIDERS",""],["GET_PROVIDER_INFO",""],["GET_PROVIDER_PROPERTY",""],["GET_SCREEN_INFO",""],["GET_SCREEN_RESOURCES",""],["GET_SCREEN_RESOURCES_CURRENT",""],["GET_SCREEN_SIZE_RANGE",""],["LIST_OUTPUT_PROPERTIES",""],["LIST_PROVIDER_PROPERTIES",""],["MAJOR_VERSION",""],["MINOR_VERSION",""],["MODE_FLAG_BCAST",""],["MODE_FLAG_CSYNC",""],["MODE_FLAG_CSYNC_NEGATIVE",""],["MODE_FLAG_CSYNC_POSITIVE",""],["MODE_FLAG_DOUBLE_CLOCK",""],["MODE_FLAG_DOUBLE_SCAN",""],["MODE_FLAG_HALVE_CLOCK",""],["MODE_FLAG_HSKEW_PRESENT",""],["MODE_FLAG_HSYNC_NEGATIVE",""],["MODE_FLAG_HSYNC_POSITIVE",""],["MODE_FLAG_INTERLACE",""],["MODE_FLAG_PIXEL_MULTIPLEX",""],["MODE_FLAG_VSYNC_NEGATIVE",""],["MODE_FLAG_VSYNC_POSITIVE",""],["NOTIFY",""],["NOTIFY_CRTC_CHANGE",""],["NOTIFY_MASK_CRTC_CHANGE",""],["NOTIFY_MASK_OUTPUT_CHANGE",""],["NOTIFY_MASK_OUTPUT_PROPERTY",""],["NOTIFY_MASK_PROVIDER_CHANGE",""],["NOTIFY_MASK_PROVIDER_PROPERTY",""],["NOTIFY_MASK_RESOURCE_CHANGE",""],["NOTIFY_MASK_SCREEN_CHANGE",""],["NOTIFY_OUTPUT_CHANGE",""],["NOTIFY_OUTPUT_PROPERTY",""],["NOTIFY_PROVIDER_CHANGE",""],["NOTIFY_PROVIDER_PROPERTY",""],["NOTIFY_RESOURCE_CHANGE",""],["PROVIDER_CAPABILITY_SINK_OFFLOAD",""],["PROVIDER_CAPABILITY_SINK_OUTPUT",""],["PROVIDER_CAPABILITY_SOURCE_OFFLOAD",""],["PROVIDER_CAPABILITY_SOURCE_OUTPUT",""],["QUERY_OUTPUT_PROPERTY",""],["QUERY_PROVIDER_PROPERTY",""],["QUERY_VERSION",""],["ROTATION_REFLECT_X",""],["ROTATION_REFLECT_Y",""],["ROTATION_ROTATE_0",""],["ROTATION_ROTATE_180",""],["ROTATION_ROTATE_270",""],["ROTATION_ROTATE_90",""],["SCREEN_CHANGE_NOTIFY",""],["SELECT_INPUT",""],["SET_CONFIG_FAILED",""],["SET_CONFIG_INVALID_CONFIG_TIME",""],["SET_CONFIG_INVALID_TIME",""],["SET_CONFIG_SUCCESS",""],["SET_CRTC_CONFIG",""],["SET_CRTC_GAMMA",""],["SET_CRTC_TRANSFORM",""],["SET_OUTPUT_PRIMARY",""],["SET_PANNING",""],["SET_PROVIDER_OFFLOAD_SINK",""],["SET_PROVIDER_OUTPUT_SOURCE",""],["SET_SCREEN_CONFIG",""],["SET_SCREEN_SIZE",""],["TRANSFORM_PROJECTIVE",""],["TRANSFORM_SCALE_DOWN",""],["TRANSFORM_SCALE_UP",""],["TRANSFORM_UNIT",""]],"fn":[["add_output_mode",""],["add_output_mode_checked",""],["change_output_property",""],["change_output_property_checked",""],["change_provider_property",""],["change_provider_property_checked",""],["configure_output_property",""],["configure_output_property_checked",""],["configure_provider_property",""],["configure_provider_property_checked",""],["create_mode",""],["create_mode_unchecked",""],["delete_output_mode",""],["delete_output_mode_checked",""],["delete_output_property",""],["delete_output_property_checked",""],["delete_provider_property",""],["delete_provider_property_checked",""],["destroy_mode",""],["destroy_mode_checked",""],["get_crtc_gamma",""],["get_crtc_gamma_size",""],["get_crtc_gamma_size_unchecked",""],["get_crtc_gamma_unchecked",""],["get_crtc_info",""],["get_crtc_info_unchecked",""],["get_crtc_transform",""],["get_crtc_transform_unchecked",""],["get_output_info",""],["get_output_info_unchecked",""],["get_output_primary",""],["get_output_primary_unchecked",""],["get_output_property",""],["get_output_property_unchecked",""],["get_panning",""],["get_panning_unchecked",""],["get_provider_info",""],["get_provider_info_unchecked",""],["get_provider_property",""],["get_provider_property_unchecked",""],["get_providers",""],["get_providers_unchecked",""],["get_screen_info",""],["get_screen_info_unchecked",""],["get_screen_resources",""],["get_screen_resources_current",""],["get_screen_resources_current_unchecked",""],["get_screen_resources_unchecked",""],["get_screen_size_range",""],["get_screen_size_range_unchecked",""],["id",""],["list_output_properties",""],["list_output_properties_unchecked",""],["list_provider_properties",""],["list_provider_properties_unchecked",""],["query_output_property",""],["query_output_property_unchecked",""],["query_provider_property",""],["query_provider_property_unchecked",""],["query_version",""],["query_version_unchecked",""],["select_input",""],["select_input_checked",""],["set_crtc_config",""],["set_crtc_config_unchecked",""],["set_crtc_gamma",""],["set_crtc_gamma_checked",""],["set_crtc_transform",""],["set_crtc_transform_checked",""],["set_output_primary",""],["set_output_primary_checked",""],["set_panning",""],["set_panning_unchecked",""],["set_provider_offload_sink",""],["set_provider_offload_sink_checked",""],["set_provider_output_source",""],["set_provider_output_source_checked",""],["set_screen_config",""],["set_screen_config_unchecked",""],["set_screen_size",""],["set_screen_size_checked",""]],"struct":[["BadCrtcError",""],["BadModeError",""],["BadOutputError",""],["BadProviderError",""],["ModeInfo",""],["OutputChange",""],["ScreenSize",""]],"type":[["Connection",""],["CreateModeCookie",""],["CreateModeReply",""],["Crtc",""],["CrtcChange",""],["CrtcChangeIterator",""],["GetCrtcGammaCookie",""],["GetCrtcGammaReply",""],["GetCrtcGammaSizeCookie",""],["GetCrtcGammaSizeReply",""],["GetCrtcInfoCookie",""],["GetCrtcInfoReply",""],["GetCrtcTransformCookie",""],["GetCrtcTransformReply",""],["GetOutputInfoCookie",""],["GetOutputInfoReply",""],["GetOutputPrimaryCookie",""],["GetOutputPrimaryReply",""],["GetOutputPropertyCookie",""],["GetOutputPropertyReply",""],["GetPanningCookie",""],["GetPanningReply",""],["GetProviderInfoCookie",""],["GetProviderInfoReply",""],["GetProviderPropertyCookie",""],["GetProviderPropertyReply",""],["GetProvidersCookie",""],["GetProvidersReply",""],["GetScreenInfoCookie",""],["GetScreenInfoReply",""],["GetScreenResourcesCookie",""],["GetScreenResourcesCurrentCookie",""],["GetScreenResourcesCurrentReply",""],["GetScreenResourcesReply",""],["GetScreenSizeRangeCookie",""],["GetScreenSizeRangeReply",""],["ListOutputPropertiesCookie",""],["ListOutputPropertiesReply",""],["ListProviderPropertiesCookie",""],["ListProviderPropertiesReply",""],["Mode",""],["ModeFlag",""],["ModeInfoIterator",""],["Notify",""],["NotifyData",""],["NotifyDataIterator",""],["NotifyEvent",""],["NotifyMask",""],["Output",""],["OutputChangeIterator",""],["OutputProperty",""],["OutputPropertyIterator",""],["Provider",""],["ProviderCapability",""],["ProviderChange",""],["ProviderChangeIterator",""],["ProviderProperty",""],["ProviderPropertyIterator",""],["QueryOutputPropertyCookie",""],["QueryOutputPropertyReply",""],["QueryProviderPropertyCookie",""],["QueryProviderPropertyReply",""],["QueryVersionCookie",""],["QueryVersionReply",""],["RefreshRates",""],["RefreshRatesIterator",""],["ResourceChange",""],["ResourceChangeIterator",""],["Rotation",""],["ScreenChangeNotifyEvent",""],["ScreenSizeIterator",""],["SetConfig",""],["SetCrtcConfigCookie",""],["SetCrtcConfigReply",""],["SetPanningCookie",""],["SetPanningReply",""],["SetScreenConfigCookie",""],["SetScreenConfigReply",""],["Transform",""]]});