class PolygonERC721Service {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  async syncToken(network: string, contractAddress: string, tokenID: string) {
    throw new Error('Not implemented yet');
  }

  async getNFTsByAddress(address: string) {
    throw new Error('Not implemented yet');
  }

  async getToken(network: string, contractAddress: string, tokenID: string) {
    throw new Error('Not implemented yet');
  }

  async getTokenOwner(network: string, contractAddress: string, tokenID: string): Promise<string> {
    throw new Error('Not implemented yet');
  }
}

export default PolygonERC721Service;
