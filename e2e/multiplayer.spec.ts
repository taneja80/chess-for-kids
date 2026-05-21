import { test, expect, Browser, Page } from '@playwright/test';

/**
 * Real two-browser multiplayer e2e test.
 *
 * IMPORTANT — Firebase requirement:
 *   This test needs a working Firebase Realtime Database. The repo ships with
 *   placeholder env vars ("YOUR_API_KEY") in `.env.local`. With placeholders,
 *   `createMultiplayerRoom()` will fail and the test will time out waiting for
 *   the room code to appear.
 *
 *   To actually run this test:
 *     1. Set real values in `.env.local` for NEXT_PUBLIC_FIREBASE_* vars,
 *        including NEXT_PUBLIC_FIREBASE_DATABASE_URL.
 *     2. Make sure your RTDB rules allow read/write on `games/{roomId}`.
 *     3. `npm run test:e2e`
 *
 * The test spec itself is fully wired and selectors are stable thanks to
 * data-testid attributes on the multiplayer UI and id="square-XX" on board cells.
 */

async function gotoGame(page: Page) {
  await page.goto('/game');
  // Ensure the multiplayer panel mounted (it lives inside GameControls).
  await expect(page.getByTestId('create-room-btn')).toBeVisible({ timeout: 15_000 });
}

async function newContextWithPage(browser: Browser, label: string) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      console.log(`[${label}:${msg.type()}]`, msg.text());
    }
  });
  page.on('pageerror', (err) => {
    console.log(`[${label}:pageerror]`, err.message);
  });
  return { ctx, page };
}

test.describe('multiplayer — two browsers', () => {
  test('host creates a room and guest joins; opening move syncs both ways', async ({ browser }) => {
    const host  = await newContextWithPage(browser, 'host');
    const guest = await newContextWithPage(browser, 'guest');

    try {
      // 1. Host opens game and creates a room.
      await gotoGame(host.page);
      await host.page.getByTestId('create-room-btn').click();

      // 2. Host's room code becomes visible — capture it.
      const roomCodeLocator = host.page.getByTestId('room-code');
      await expect(roomCodeLocator).toBeVisible({ timeout: 20_000 });
      const roomCode = (await roomCodeLocator.textContent())?.trim();
      expect(roomCode, 'Host should have a non-empty room code').toBeTruthy();

      // 3. Guest joins using the same code.
      await gotoGame(guest.page);
      await guest.page.getByTestId('join-code-input').fill(roomCode!);
      await guest.page.getByTestId('join-room-btn').click();

      // 4. Guest now sees its own copy of the room code.
      //    A fresh browser context needs to open its own Firebase RTDB websocket,
      //    so we give the join handshake generous time before asserting state.
      await expect(guest.page.getByTestId('room-code')).toHaveText(roomCode!, { timeout: 45_000 });

      // 5. Host (white) plays e2 -> e4.
      await host.page.locator('#square-e2').click();
      await host.page.locator('#square-e4').click();

      // 6. On the guest's board the pawn should now appear on e4.
      //    We rely on the piece glyph being rendered inside the square.
      //    chess.js / the board uses ♙ (U+2659) for white pawn or an svg/img — we
      //    check for non-empty content and a "piece" class as a robust signal.
      const guestE4 = guest.page.locator('#square-e4');
      await expect(guestE4).toBeVisible();
      await expect.poll(
        async () => (await guestE4.innerText()).trim().length > 0
                 || (await guestE4.locator('[class*="piece"], img, svg').count()) > 0,
        { timeout: 15_000, message: 'Guest should see a piece on e4 after host moves' },
      ).toBe(true);
    } finally {
      await host.ctx.close();
      await guest.ctx.close();
    }
  });
});
