/**
 * Mealist API
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { CreateQrMenuItem } from './createQrMenuItem';


export interface CreateQrMenuRequest { 
    name?: string;
    displayName?: string;
    primaryColor?: string;
    secondaryColor?: string;
    fontColor?: string;
    previewIndex?: number;
    urlSuffix?: string;
    items?: Array<CreateQrMenuItem>;
    restaurantId: string;
    sectionsToShow?: Array<string>;
}

