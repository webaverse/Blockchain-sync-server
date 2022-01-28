interface IMoralisNFTResult {
  token_address: string;
  token_id: string;
  block_number_minted: string;
  owner_of: string;
  block_number: string;
  amount: string;
  contract_type: string;
  name: string;
  symbol: string;
  token_uri: string | null;
  metadata: string | null;
  synced_at: string | null;
  is_valid: Number;
  syncing: Number;
  frozen: Number;
}

export interface IMoralisNFTResponse {
  total: Number;
  page: Number;
  page_size: Number;
  result: IMoralisNFTResult[];
}
