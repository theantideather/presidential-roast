use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};
use anchor_spl::metadata::{
    self, 
    create_metadata_accounts_v3, 
    CreateMetadataAccountsV3, 
    Metadata
};
use mpl_token_metadata::types::{DataV2, Creator};

declare_id!("RoaStnFttMhnLXVxY5Lz2RXRxUWzjXtjuYP3oTNro4R");

#[program]
pub mod roast_nft {
    use super::*;

    // Mint a new Presidential Roast NFT
    pub fn mint_roast_nft(
        ctx: Context<MintRoastNFT>,
        roast_content: String,
        score: u8,
        is_executive_order: bool,
        uri: String,
    ) -> Result<()> {
        // Create the NFT mint
        token::initialize_mint(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::InitializeMint {
                    mint: ctx.accounts.mint.to_account_info(),
                    rent: ctx.accounts.rent.to_account_info(),
                },
            ),
            0, // 0 decimals for NFT
            ctx.accounts.authority.key,
            Some(ctx.accounts.authority.key),
        )?;

        // Create associated token account
        anchor_spl::associated_token::create(
            CpiContext::new(
                ctx.accounts.associated_token_program.to_account_info(),
                anchor_spl::associated_token::Create {
                    payer: ctx.accounts.authority.to_account_info(),
                    associated_token: ctx.accounts.token_account.to_account_info(),
                    authority: ctx.accounts.owner.to_account_info(),
                    mint: ctx.accounts.mint.to_account_info(),
                    system_program: ctx.accounts.system_program.to_account_info(),
                    token_program: ctx.accounts.token_program.to_account_info(),
                    rent: ctx.accounts.rent.to_account_info(),
                },
            ),
        )?;

        // Mint 1 token to the owner
        token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                token::MintTo {
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.token_account.to_account_info(),
                    authority: ctx.accounts.authority.to_account_info(),
                },
                &[],
            ),
            1, // Mint 1 token for NFT
        )?;

        // Create metadata
        let name = if is_executive_order {
            format!("Presidential Roast Executive Order #{}", score)
        } else {
            format!("Presidential Roast #{}", score)
        };

        // Truncate roast to fit in description
        let description = if roast_content.len() > 200 {
            format!("{}...", &roast_content[..197])
        } else {
            roast_content.clone()
        };

        // Set up creators with royalties
        let creators = vec![
            Creator {
                address: ctx.accounts.authority.key(),
                verified: true,
                share: 100,
            },
        ];

        // Create metadata account
        let data_v2 = DataV2 {
            name,
            symbol: String::from("PROAST"),
            uri: uri,
            seller_fee_basis_points: 500, // 5% royalties
            creators: Some(creators),
            collection: None,
            uses: None,
        };

        create_metadata_accounts_v3(
            CpiContext::new_with_signer(
                ctx.accounts.token_metadata_program.to_account_info(),
                CreateMetadataAccountsV3 {
                    metadata: ctx.accounts.metadata.to_account_info(),
                    mint: ctx.accounts.mint.to_account_info(),
                    mint_authority: ctx.accounts.authority.to_account_info(),
                    payer: ctx.accounts.authority.to_account_info(),
                    update_authority: ctx.accounts.authority.to_account_info(),
                    system_program: ctx.accounts.system_program.to_account_info(),
                    rent: ctx.accounts.rent.to_account_info(),
                },
                &[],
            ),
            data_v2,
            true,  // is_mutable
            true,  // update_authority_is_signer
            None,  // collection_details
        )?;

        // Store roast data on-chain
        let roast_data = &mut ctx.accounts.roast_data;
        roast_data.mint = ctx.accounts.mint.key();
        roast_data.owner = ctx.accounts.owner.key();
        roast_data.content = roast_content;
        roast_data.score = score;
        roast_data.is_executive_order = is_executive_order;
        roast_data.timestamp = Clock::get()?.unix_timestamp;

        // Disable further minting (make it a true NFT)
        token::set_authority(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                token::SetAuthority {
                    account_or_mint: ctx.accounts.mint.to_account_info(),
                    current_authority: ctx.accounts.authority.to_account_info(),
                },
                &[],
            ),
            token::spl_token::instruction::AuthorityType::MintTokens,
            None,
        )?;

        Ok(())
    }
}

#[account]
pub struct RoastData {
    pub mint: Pubkey,          // The mint address of this NFT
    pub owner: Pubkey,         // The original owner
    pub content: String,       // The roast content
    pub score: u8,             // Roast score (0-100)
    pub is_executive_order: bool, // Whether this is an executive order roast
    pub timestamp: i64,        // When this was minted
}

#[derive(Accounts)]
pub struct MintRoastNFT<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    /// CHECK: This is the owner of the NFT
    pub owner: AccountInfo<'info>,
    
    #[account(
        init,
        payer = authority,
        mint::decimals = 0,
        mint::authority = authority.key(),
    )]
    pub mint: Account<'info, Mint>,
    
    #[account(
        init,
        payer = authority,
        associated_token::mint = mint,
        associated_token::authority = owner,
    )]
    pub token_account: Account<'info, TokenAccount>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 4 + 500 + 1 + 1 + 8, // Space for RoastData
        seeds = [b"roast", mint.key().as_ref()],
        bump
    )]
    pub roast_data: Account<'info, RoastData>,
    
    /// CHECK: Metadata account
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,
    
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, anchor_spl::associated_token::AssociatedToken>,
    
    /// CHECK: Metaplex token metadata program
    #[account(address = mpl_token_metadata::ID)]
    pub token_metadata_program: UncheckedAccount<'info>,
    
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
} 