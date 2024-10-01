import { Operation } from 'express-openapi';
import { components } from '../../../api';
import { menusService } from '../../menus';
import { MenuLine, MenuPage, OcrBox, UpdateMenuPageCommand } from '../../../../domain/models/menu';

type MenuPageApiModel = components['schemas']['MenuPage'];
type MenuLineApiModel = components['schemas']['MenuLine'];

export const PUT: Operation = [
  async (req, res) => {
    const menuId = req?.params?.id;
    const pages = req.body as MenuPageApiModel[];

    const pagesDomainModel = pages.map(mapPageApiModelToDomainModel);
    await menusService.updateMenuPages(menuId, pagesDomainModel);
    res.status(200).send();
  },
];

PUT.apiDoc = {
  description: 'Update Menu Pages',
  operationId: 'updateMenuPages',
  tags: ['menus'],
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: {
        type: 'string',
      },
      description: 'Menu ID',
    },
  ],
  requestBody: {
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/MenuPage',
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Menu Pages Updated',
    },
  },
};

export const mapPageApiModelToDomainModel = (page: MenuPageApiModel): UpdateMenuPageCommand => {
  return {
    pageNumber: page.pageNumber,
    markup: page.markup ? mapMarkupToDomain(page.markup) : [],
  };
};

export const mapMarkupToDomain = (markup: MenuLineApiModel[]): MenuLine[] => {
  return markup.map((line: MenuLineApiModel, i: number) => {
    return {
      blockId: i + '',
      text: line.text ?? '',
      box: {
        x1: line.x1,
        y1: line.y1,
        x2: line.x2,
        y2: line.y2,
      } as OcrBox,
    };
  });
};
