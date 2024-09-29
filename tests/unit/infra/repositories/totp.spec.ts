import {
  DeleteItemCommandInput,
  GetItemCommandInput,
  PutItemCommandInput,
} from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { faker } from '@faker-js/faker';
import {
  deleteByEmail,
  getOneByEmail,
  save,
  TOTP_TABLE_NAME,
} from '../../../../src/infra/repositories/totp';

const mockGetItem = jest.fn();
const mockPutItem = jest.fn();
const mockDeleteItem = jest.fn();

jest.mock('@aws-sdk/client-dynamodb', () => {
  return {
    DynamoDB: function DynamoDB() {
      return {
        getItem: (args: GetItemCommandInput) => mockGetItem(args),
        putItem: (args: PutItemCommandInput) => mockPutItem(args),
        deleteItem: (args: DeleteItemCommandInput) => mockDeleteItem(args),
      };
    },
  };
});

describe('TotpRepository', () => {
  it('should be able to get one totp by email', async () => {
    const email = faker.internet.email();
    const totp = { email };

    mockGetItem.mockResolvedValue({ Item: marshall(totp) });

    const response = await getOneByEmail(email);

    expect(mockGetItem).toHaveBeenCalledWith({
      TableName: TOTP_TABLE_NAME,
      Key: marshall({
        email,
      }),
    });
    expect(response).toEqual(totp);
  });

  it('should not be able to get one totp by email', async () => {
    mockGetItem.mockResolvedValue({ Item: undefined });

    const email = faker.internet.email();
    const response = await getOneByEmail(email);

    expect(mockGetItem).toHaveBeenCalledWith({
      TableName: TOTP_TABLE_NAME,
      Key: marshall({
        email,
      }),
    });
    expect(response).toBe(null);
  });

  it('should be able to save a totp', async () => {
    const totp = { email: faker.internet.email() };
    await save(totp);

    expect(mockPutItem).toHaveBeenCalledWith({
      TableName: TOTP_TABLE_NAME,
      Item: marshall(totp),
    });
  });

  it('should be able to delete a totp by email', async () => {
    const email = faker.internet.email();
    await deleteByEmail(email);

    expect(mockDeleteItem).toHaveBeenCalledWith({
      TableName: TOTP_TABLE_NAME,
      Key: marshall({
        email,
      }),
    });
  });
});
