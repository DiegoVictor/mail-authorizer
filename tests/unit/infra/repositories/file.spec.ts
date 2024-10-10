import { faker } from '@faker-js/faker';
import {
  PutItemCommandInput,
  QueryCommandInput,
} from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import {
  FILES_TABLE_NAME,
  getManyPaginated,
  getOneById,
  save,
} from '../../../../src/infra/repositories/files';
import { IFileType } from '../../../../src/contracts/file';

const mockQuery = jest.fn();
const mockPutItem = jest.fn();

jest.mock('@aws-sdk/client-dynamodb', () => {
  return {
    DynamoDB: function DynamoDB(params: Record<string, string>) {
      return {
        params,
        query: (args: QueryCommandInput) => mockQuery(args),
        putItem: (args: PutItemCommandInput) => mockPutItem(args),
      };
    },
  };
});

const OLD_ENV = {
  ...process.env,
};

describe('FileRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = OLD_ENV;
  });

  it('should be able to get one file by id', async () => {
    const id = faker.string.uuid();
    const file = { id };
    mockQuery.mockResolvedValue({ Items: [marshall(file)] });

    const response = await getOneById(id);

    expect(mockQuery).toHaveBeenCalledWith({
      TableName: FILES_TABLE_NAME,
      KeyConditions: {
        id: {
          ComparisonOperator: 'EQ',
          AttributeValueList: [marshall(id)],
        },
      },
      ScanIndexForward: false,
      Limit: 1,
    });
    expect(response).toEqual(file);
  });

  it('should not be able to get one file by id', async () => {
    const id = faker.string.uuid();
    mockQuery.mockResolvedValue({ Items: [] });

    const response = await getOneById(id);

    expect(mockQuery).toHaveBeenCalledWith({
      TableName: FILES_TABLE_NAME,
      KeyConditions: {
        id: {
          ComparisonOperator: 'EQ',
          AttributeValueList: [marshall(id)],
        },
      },
      ScanIndexForward: false,
      Limit: 1,
    });
    expect(response).toBe(null);
  });

  it('should be able to get many files paginated', async () => {
    const id = faker.string.uuid();
    const file = { id, createdAt: faker.date.past().getTime() };
    mockQuery.mockResolvedValue({
      Items: [marshall(file)],
      LastEvaluatedKey: marshall({ id, createdAt: file.createdAt }),
    });

    const response = await getManyPaginated();

    expect(mockQuery).toHaveBeenCalledWith({
      TableName: FILES_TABLE_NAME,
      ScanIndexForward: false,
      Limit: 10,
      IndexName: 'TypeIndex',
      KeyConditionExpression: '#type = :type',
      ExpressionAttributeNames: {
        '#type': 'type',
      },
      ExpressionAttributeValues: {
        ':type': { S: IFileType.VIDEO },
      },
    });
    expect(response).toEqual({
      data: [file],
      cursorId: Buffer.from(`${id}:${file.createdAt}`).toString('base64'),
    });
  });

  it('should be able to get many files using cursorId', async () => {
    const id = faker.string.uuid();
    const file = { id };
    mockQuery.mockResolvedValue({ Items: [marshall(file)] });

    const createdAt = faker.date.past().getTime();
    const response = await getManyPaginated(
      10,
      Buffer.from(`${id}:${createdAt}`).toString('base64')
    );

    expect(mockQuery).toHaveBeenCalledWith({
      TableName: FILES_TABLE_NAME,
      ScanIndexForward: false,
      Limit: 10,
      IndexName: 'TypeIndex',
      KeyConditionExpression: '#type = :type',
      ExclusiveStartKey: marshall({
        id,
        type: IFileType.VIDEO,
        createdAt,
      }),
      ExpressionAttributeNames: {
        '#type': 'type',
      },
      ExpressionAttributeValues: {
        ':type': { S: IFileType.VIDEO },
      },
    });
    expect(response).toEqual({ data: [file] });
  });

  it('should be able to save a file', async () => {
    const file = { id: faker.string.uuid() };

    await save(file);

    expect(mockPutItem).toHaveBeenCalledWith({
      TableName: FILES_TABLE_NAME,
      Item: marshall(file),
    });
  });

  it('should be able to redirect DynamoDB endpoint', async () => {
    process.env.IS_OFFLINE = '1';

    jest.resetModules();
    const {
      dynamodb: { params },
    } = require('../../../../src/infra/repositories/files');

    expect(params.endpoint).toBe('http://localhost:4566');
  });
});
