use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod roast_token {
    use super::*;

    // Initialize the ROAST token
    pub fn initialize_token(
        ctx: Context<InitializeToken>,
        name: String,
        symbol: String,
        uri: String,
        decimals: u8,
    ) -> Result<()> {
        let token_mint = &mut ctx.accounts.token_mint;
        let mint_authority = &ctx.accounts.mint_authority;
        let token_program = &ctx.accounts.token_program;
        
        // Create the token mint
        token::initialize_mint(
            CpiContext::new(
                token_program.to_account_info(),
                token::InitializeMint {
                    mint: token_mint.to_account_info(),
                    rent: ctx.accounts.rent.to_account_info(),
                },
            ),
            decimals,
            mint_authority.key,
            Some(mint_authority.key),
        )?;

        // Store metadata
        let metadata = &mut ctx.accounts.metadata;
        metadata.name = name;
        metadata.symbol = symbol;
        metadata.uri = uri;
        metadata.mint = token_mint.key();
        metadata.authority = mint_authority.key();
        metadata.verified = true;
        
        Ok(())
    }

    // Mint ROAST tokens to a user
    pub fn mint_tokens(
        ctx: Context<MintTokens>,
        amount: u64,
    ) -> Result<()> {
        let token_mint = &ctx.accounts.token_mint;
        let token_account = &ctx.accounts.token_account;
        let mint_authority = &ctx.accounts.mint_authority;
        let token_program = &ctx.accounts.token_program;
        
        // Mint tokens to the user's token account
        token::mint_to(
            CpiContext::new_with_signer(
                token_program.to_account_info(),
                token::MintTo {
                    mint: token_mint.to_account_info(),
                    to: token_account.to_account_info(),
                    authority: mint_authority.to_account_info(),
                },
                &[],
            ),
            amount,
        )?;
        
        Ok(())
    }

    // Award ROAST tokens based on roast score
    pub fn award_tokens(
        ctx: Context<AwardTokens>,
        score: u8,
    ) -> Result<()> {
        let amount = calculate_token_award(score);
        
        let token_mint = &ctx.accounts.token_mint;
        let token_account = &ctx.accounts.token_account;
        let mint_authority = &ctx.accounts.mint_authority;
        let token_program = &ctx.accounts.token_program;
        
        // Mint tokens to the user's token account
        token::mint_to(
            CpiContext::new_with_signer(
                token_program.to_account_info(),
                token::MintTo {
                    mint: token_mint.to_account_info(),
                    to: token_account.to_account_info(),
                    authority: mint_authority.to_account_info(),
                },
                &[],
            ),
            amount,
        )?;
        
        Ok(())
    }
}

// Calculate token award based on score
fn calculate_token_award(score: u8) -> u64 {
    let base_amount: u64 = 10_000_000_000; // 10 tokens with 9 decimals
    match score {
        90..=100 => base_amount * 10, // 100 tokens
        70..=89 => base_amount * 5,   // 50 tokens
        50..=69 => base_amount * 2,   // 20 tokens
        _ => base_amount,             // 10 tokens
    }
}

#[account]
pub struct TokenMetadata {
    pub name: String,
    pub symbol: String,
    pub uri: String,
    pub mint: Pubkey,
    pub authority: Pubkey,
    pub verified: bool,
}

#[derive(Accounts)]
pub struct InitializeToken<'info> {
    #[account(mut)]
    pub mint_authority: Signer<'info>,
    
    #[account(
        init,
        payer = mint_authority,
        space = 8 + 32 + 4 + 10 + 4 + 5 + 4 + 200 + 32 + 32 + 1,
        seeds = [b"metadata", token_mint.key().as_ref()],
        bump
    )]
    pub metadata: Account<'info, TokenMetadata>,
    
    #[account(
        init,
        payer = mint_authority,
        mint::decimals = 9,
        mint::authority = mint_authority.key(),
    )]
    pub token_mint: Account<'info, Mint>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct MintTokens<'info> {
    #[account(mut)]
    pub mint_authority: Signer<'info>,
    
    #[account(
        mut,
        constraint = token_mint.mint_authority == COption::Some(mint_authority.key())
    )]
    pub token_mint: Account<'info, Mint>,
    
    #[account(
        mut,
        constraint = token_account.mint == token_mint.key(),
        constraint = token_account.owner == receiver.key(),
    )]
    pub token_account: Account<'info, TokenAccount>,
    
    /// CHECK: This is the account that will receive tokens
    pub receiver: AccountInfo<'info>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AwardTokens<'info> {
    #[account(mut)]
    pub mint_authority: Signer<'info>,
    
    #[account(
        mut,
        constraint = token_mint.mint_authority == COption::Some(mint_authority.key())
    )]
    pub token_mint: Account<'info, Mint>,
    
    #[account(
        init_if_needed,
        payer = mint_authority,
        associated_token::mint = token_mint,
        associated_token::authority = receiver,
    )]
    pub token_account: Account<'info, TokenAccount>,
    
    /// CHECK: This is the user account that will receive tokens
    pub receiver: AccountInfo<'info>,
    
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
} 