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
import { MenuLine } from './menuLine';


export interface Menu { 
    id?: string;
    name: string;
    images?: Array<string>;
    menuCompressed?: boolean;
    dishesCount?: number;
    pagesCount?: number;
    state?: number;
    parsingProgress?: number;
    previewImageUrl?: string;
    originalFileUrl?: string;
    stopListEnabled?: boolean;
    stopColor?: string;
    stopStyle?: string;
    creationDate?: string;
    markups?: Array<Array<MenuLine>>;
}

