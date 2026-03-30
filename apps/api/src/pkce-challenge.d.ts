declare module "pkce-challenge" {
  interface PKCEChallenge {
    code_challenge: string;
    code_verifier: string;
  }

  function pkceChallenge(): Promise<PKCEChallenge>;

  export = pkceChallenge;
}
