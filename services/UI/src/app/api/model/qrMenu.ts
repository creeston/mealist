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
import { Restaurant } from './restaurant';
import { QrMenuStyle } from './qrMenuStyle';
import { QrMenuItem } from './qrMenuItem';


export interface QrMenu { 
    id: string;
    name: string;
    urlSuffix: string;
    title?: string;
    restaurant: Restaurant;
    sectionsToShow: Array<string>;
    style: QrMenuStyle;
    scanCount?: number;
    loadingPlaceholderMenuIndex?: number;
    loadingPlaceholderUrl: string;
    menus: Array<QrMenuItem>;
    creationDate: string;
    modificationDate?: string;
}

