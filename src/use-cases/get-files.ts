import { getManyPaginated } from '@infra/repositories/files';

const getFiles = async (cursorId?: string) => getManyPaginated(10, cursorId);

export { getFiles };
