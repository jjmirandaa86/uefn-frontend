import Phaser from "phaser";
import coinSvgUrl from "../assets/coin.svg?url";
import monsterSvgUrl from "../assets/monster.svg?url";
import playerGifUrl from "../assets/mario-running.gif?url";
import bossGifUrl from "../assets/bowser-rebolando.gif?url";
import {
  WORLD,
  SPRITES,
  bossOnFloorCenterY,
  coinAbovePlatformTier,
  enemyOnFloorCenterY,
  floatingPlatformCenterY,
  playerOnFloorCenterY,
} from "../config.js";
import { addParallaxEnvironment } from "./environmentLayers.js";

function makeTexture(scene, key, w, h, color) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  g.fillStyle(color, 1);
  g.fillRect(0, 0, w, h);
  g.generateTexture(key, w, h);
  g.destroy();
}

/** Rectángulos flotantes [centroX, tier, ancho, alto]. */
function floatPlatformsSpecs() {
  const h = WORLD.floatPlatformH;
  return [
    [420, 1, 160, h],
    [780, 2, 160, h],
    [1180, 2, 150, h],
    [1750, 1, 200, h],
    [2100, 3, 130, h],
    [2680, 2, 170, h],
    [3000, 4, 140, h],
    [3500, 1, 220, h],
    [3900, 3, 150, h],
    [4200, 4, 170, h],
  ];
}

/**
 * Nivel único: plataformas, monedas, enemigos, huecos, meta, enemigo final.
 * Controles: `registry.get("controlsRef")` (ref React con moveX, mouthOpen, sprint, eyeShoot).
 */
export class MainGameScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainGameScene" });
  }

  preload() {
    this.load.image("tex_coin", coinSvgUrl);
    this.load.image("tex_enemy", monsterSvgUrl);
    /** Cuerpo físico invisible; el GIF animado va en capa DOM (`this.playerDom`). */
    makeTexture(this, "tex_player", SPRITES.playerW, SPRITES.playerH, 0x0f172a);
    makeTexture(this, "tex_ground", 120, 24, 0x334155);
    makeTexture(this, "tex_flag", SPRITES.flagW, SPRITES.flagH, 0xa855f7);
    makeTexture(this, "tex_fire", SPRITES.fireDisplay, SPRITES.fireDisplay, 0xf43f5e);
    /** Cuerpo físico invisible; Bowser en DOM (`this.bossDom`). */
    makeTexture(
      this,
      "tex_boss",
      SPRITES.bossDisplayW,
      SPRITES.bossDisplayH,
      0x1a0508,
    );
  }

  create() {
    this.physics.world.setBounds(0, 0, WORLD.width, WORLD.height);
    this.physics.world.gravity.y = 980;

    this.controlsRef = this.game.registry.get("controlsRef");
    this.onHud = this.game.registry.get("onHudUpdate") ?? (() => {});
    this.onVictory = this.game.registry.get("onVictory") ?? (() => {});
    this.onGameOver = this.game.registry.get("onGameOver") ?? (() => {});

    this.score = 0;
    this.lives = 3;
    this.coinsCollected = 0;
    this.jumpCooldown = 0;
    this.shootCooldown = 0;
    this.bossHp = 5;
    this.bossTouchMs = 0;
    this.hitCd = 0;

    addParallaxEnvironment(this, WORLD);

    const dust = this.add.particles(0, 0, "tex_coin", {
      x: { min: 0, max: WORLD.width },
      y: { min: 0, max: 220 },
      lifespan: 5000,
      speedY: { min: 6, max: 22 },
      scale: { start: SPRITES.dustParticleScaleStart, end: 0 },
      quantity: 1,
      frequency: 140,
      tint: [0x8ec5e8, 0xb8d4f0],
    });
    dust.setDepth(-38);

    this.platforms = this.physics.add.staticGroup();
    this._buildWorld();

    this.player = this.physics.add.sprite(
      120,
      playerOnFloorCenterY(),
      "tex_player",
    );
    this.player.setVisible(false);
    this.playerDom = this.add.dom(this.player.x, this.player.y);
    this.playerDom.createFromHTML(
      `<img src="${playerGifUrl}" alt="" draggable="false" class="game-player-gif" />`,
    );
    this.playerDom.setOrigin(0.5, 0.5);
    this.playerDom.setDepth(30);
    this.playerDom.pointerEvents = "none";
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(SPRITES.playerBodyW, SPRITES.playerBodyH);
    this.player.body.setOffset(SPRITES.playerBodyOffX, SPRITES.playerBodyOffY);
    this.player.setDragX(900);
    this.player.setMaxVelocity(420, 900);
    this.player.setDepth(30);

    this.physics.add.collider(this.player, this.platforms);

    this.coins = this.physics.add.group({ allowGravity: false });
    this._spawnCoins();
    this._startCoinIdleMotion();

    this.enemies = this.physics.add.group();
    this._spawnEnemies();
    this.physics.add.collider(this.enemies, this.platforms);

    this.flag = this.physics.add.sprite(
      WORLD.width - 200,
      WORLD.walkY - 80,
      "tex_flag",
    );
    this.flag.setDepth(28);
    this.flag.body.setAllowGravity(false);
    this.flag.body.moves = false;

    /** Enemigo final: misma posición que el rectángulo rojo original (antes de la meta). */
    const bossX = WORLD.width - 520;
    const bossY = bossOnFloorCenterY();

    this.boss = this.physics.add.sprite(bossX, bossY, "tex_boss");
    this.boss.setVisible(false);
    this.bossDom = this.add.dom(bossX, bossY);
    this.bossDom.createFromHTML(
      `<img src="${bossGifUrl}" alt="" draggable="false" class="game-boss-gif" />`,
    );
    this.bossDom.setOrigin(0.5, 0.5);
    this.bossDom.setDepth(29);
    this.bossDom.pointerEvents = "none";
    this.boss.body.setAllowGravity(false);
    this.boss.setImmovable(true);
    this.boss.body.setSize(SPRITES.bossBodyW, SPRITES.bossBodyH);
    this.boss.body.setOffset(
      (SPRITES.bossDisplayW - SPRITES.bossBodyW) / 2,
      (SPRITES.bossDisplayH - SPRITES.bossBodyH) / 2,
    );
    this.boss.refreshBody();
    this.boss.setDepth(28);

    this.projectiles = this.physics.add.group();

    this.physics.add.overlap(this.player, this.coins, (_, coin) => {
      if (!coin.active) return;
      coin.disableBody(true, true);
      this.coinsCollected += 1;
      this.score += 100;
      this._emitHud();
      this._burst(coin.x, coin.y, 0xfacc15);
    });

    this.physics.add.overlap(this.player, this.enemies, (p, enemy) => {
      if (!enemy.active) return;
      if (p.body.velocity.y > 55 && p.body.bottom <= enemy.body.top + SPRITES.stompEnemyMargin) {
        enemy.disableBody(true, true);
        this.score += 250;
        p.setVelocityY(-380);
        this._emitHud();
        this.cameras.main.shake(90, 0.004);
        this._burst(enemy.x, enemy.y, 0xf97316);
      } else if (this.hitCd <= 0) {
        this.hitCd = 900;
        this._damagePlayer(1);
      }
    });

    this.physics.add.overlap(this.player, this.flag, () => {
      this.onVictory();
      this.scene.pause();
    });

    this.physics.add.overlap(this.player, this.boss, () => {
      const now = this.time.now;
      if (now - this.bossTouchMs < 650) return;
      this.bossTouchMs = now;
      this._damagePlayer(1);
    });

    this.physics.add.overlap(this.projectiles, this.boss, (ball) => {
      if (!this.boss.active) return;
      ball.destroy();
      this.bossHp -= 1;
      this.score += 150;
      this._emitHud();
      this.cameras.main.shake(120, 0.006);
      if (this.bossHp <= 0) {
        this.boss.disableBody(true, true);
        if (this.bossDom) {
          this.bossDom.setVisible(false);
          this.bossDom.destroy();
          this.bossDom = null;
        }
        this._burst(this.boss.x, this.boss.y, 0xf43f5e);
      }
    });

    this.physics.add.overlap(this.projectiles, this.enemies, (ball, enemy) => {
      ball.destroy();
      if (!enemy.active) return;
      enemy.disableBody(true, true);
      this.score += 180;
      this._emitHud();
      this._burst(enemy.x, enemy.y, 0xf97316);
    });

    this.cameras.main.setBounds(0, 0, WORLD.width, WORLD.height);
    /**
     * Offset Y negativo: el punto de seguimiento queda un poco por debajo del jugador,
     * así el personaje y el suelo quedan más arriba en pantalla (menos recorte abajo).
     */
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12, 0, -10);
    this.cameras.main.setDeadzone(160, 96);

    this._emitHud();
  }

  /** Suelo con huecos + plataformas flotantes (rectángulos estáticos). */
  _buildWorld() {
    const top = WORLD.walkY - 12;
    for (let x = 60; x < WORLD.width - 80; x += 120) {
      if (this._isGap(x)) continue;
      const p = this.platforms.create(x, top, "tex_ground");
      p.refreshBody();
      p.setDepth(8);
    }

    /** [centroX, tier, ancho, alto] — el Y sale de `WORLD.floatPlatform*` + `floorSurfaceTopY()`. */
    for (const [cx, tier, w, h] of floatPlatformsSpecs()) {
      const cy = floatingPlatformCenterY(tier, h);
      const r = this.add.rectangle(cx, cy, w, h, 0x334155);
      this.physics.add.existing(r, true);
      this.platforms.add(r);
      r.setDepth(8);
    }
  }

  _isGap(centerX) {
    const gaps = [
      [820, 1020],
      [1480, 1720],
      [2360, 2580],
      [3180, 3400],
    ];
    return gaps.some(([a, b]) => centerX >= a && centerX <= b);
  }

  _spawnCoins() {
    const gy = playerOnFloorCenterY() + SPRITES.coinGroundYOffset;
    const spots = [
      [440, coinAbovePlatformTier(1)],
      [800, coinAbovePlatformTier(2)],
      [1200, coinAbovePlatformTier(2)],
      [1780, coinAbovePlatformTier(1)],
      [2120, coinAbovePlatformTier(3)],
      [2700, coinAbovePlatformTier(2)],
      [3020, coinAbovePlatformTier(4)],
      [3520, coinAbovePlatformTier(1)],
      [3920, coinAbovePlatformTier(3)],
      [4220, coinAbovePlatformTier(4)],
      [620, gy],
      [2050, gy],
      [3350, gy],
    ];
    for (const [x, y] of spots) {
      const c = this.coins.create(x, y, "tex_coin");
      c.body.setAllowGravity(false);
      c.setDisplaySize(SPRITES.coinDisplay, SPRITES.coinDisplay);
      c.body.setCircle(SPRITES.coinHitRadius);
      c.refreshBody();
      c.setDepth(14);
    }
  }

  _startCoinIdleMotion() {
    this.coins.children.iterate((coin) => {
      if (!coin?.active) return;
      const y0 = coin.y;
      const delay = Phaser.Math.Between(0, 550);
      this.tweens.add({
        targets: coin,
        y: y0 - SPRITES.coinTweenFloat,
        angle: { from: -5, to: 5 },
        duration: 700 + Phaser.Math.Between(0, 200),
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
        delay,
      });
    });
  }

  _spawnEnemies() {
    const ey = enemyOnFloorCenterY();
    const spots = [520, 1280, 2200, 2880, 3600];
    for (const x of spots) {
      const e = this.enemies.create(x, ey, "tex_enemy");
      e.setBounce(1, 0);
      e.setCollideWorldBounds(true);
      e.setVelocityX(Phaser.Math.Between(0, 1) ? 95 : -95);
      e.setDisplaySize(SPRITES.enemyDisplay, SPRITES.enemyDisplay);
      e.body.setSize(SPRITES.enemyBodyW, SPRITES.enemyBodyH);
      e.body.setOffset(SPRITES.enemyBodyOffX, SPRITES.enemyBodyOffY);
      e.refreshBody();
      e.setDepth(12);
    }
  }

  _emitHud() {
    this.onHud({
      score: this.score,
      lives: this.lives,
      coins: this.coinsCollected,
      bossHp: this.bossHp,
    });
  }

  _burst(x, y, tint) {
    const p = this.add.particles(x, y, "tex_coin", {
      speed: { min: -140, max: 140 },
      angle: { min: 0, max: 360 },
      lifespan: 450,
      quantity: 12,
      scale: { start: SPRITES.burstParticleScaleStart, end: 0 },
      tint,
    });
    this.time.delayedCall(500, () => p.destroy());
  }

  _damagePlayer(amount = 1) {
    this.lives -= amount;
    this.cameras.main.shake(200, 0.012);
    this.player.setVelocity(0, -420);
    this.player.setPosition(
      Math.max(100, this.player.x - 70),
      playerOnFloorCenterY(),
    );
    this._emitHud();
    if (this.lives <= 0) {
      this.onGameOver();
      this.scene.pause();
    }
  }

  update(time, delta) {
    const c = this.controlsRef?.current;
    if (!c) return;

    this.jumpCooldown = Math.max(0, this.jumpCooldown - delta);
    this.shootCooldown = Math.max(0, this.shootCooldown - delta);
    this.hitCd = Math.max(0, this.hitCd - delta);

    const runMul = c.sprint ? 1.55 : 1;
    const maxX = c.sprint ? 320 : 220;
    this.player.setAccelerationX(c.moveX * 980 * runMul);
    this.player.setMaxVelocity(maxX, 900);

    if (c.moveX < -0.08) this.player.setFlipX(true);
    else if (c.moveX > 0.08) this.player.setFlipX(false);

    if (
      c.mouthOpen > 0.2 &&
      this.jumpCooldown <= 0 &&
      this.player.body.blocked.down
    ) {
      const strength = Phaser.Math.Clamp(c.mouthOpen, 0.2, 1);
      const vy = -(360 + strength * 280);
      this.player.setVelocityY(vy);
      this.jumpCooldown = 340;
    }

    const eyeThr = this.game.registry.get("eyeShootThreshold") ?? 0.58;
    /** Disparo entrecerrando ojos + boca casi cerrada (evita saltos) y sin sprint fuerte. */
    const shootIntent =
      c.eyeShoot >= eyeThr && c.mouthOpen < 0.16 && c.smile < 0.45;
    if (shootIntent && this.shootCooldown <= 0) {
      const ball = this.projectiles.create(
        this.player.x + (this.player.flipX ? -SPRITES.shootSpawnX : SPRITES.shootSpawnX),
        this.player.y - SPRITES.shootSpawnY,
        "tex_fire",
      );
      ball.body.setAllowGravity(false);
      ball.setDisplaySize(SPRITES.fireDisplay, SPRITES.fireDisplay);
      ball.refreshBody();
      ball.setVelocityX(this.player.flipX ? -440 : 440);
      ball.setVelocityY(-50);
      ball.setDepth(18);
      this.shootCooldown = 540;
      this.cameras.main.shake(55, 0.003);
    }

    this.enemies.children.iterate((e) => {
      if (!e?.body) return;
      if (Math.abs(e.body.velocity.x) < 24) {
        e.setVelocityX(e.body.velocity.x >= 0 ? 95 : -95);
      }
    });

    if (this.player.y > WORLD.height + 100) {
      this._damagePlayer(1);
      this.player.setPosition(120, playerOnFloorCenterY());
    }

    if (this.playerDom) {
      this.playerDom.setPosition(this.player.x, this.player.y);
      this.playerDom.setVisible(!this.scene.isPaused());
      const img = this.playerDom.node?.querySelector?.("img");
      if (img) {
        img.style.transform = this.player.flipX ? "scaleX(-1)" : "";
      }
    }

    if (this.bossDom && this.boss?.active) {
      this.bossDom.setPosition(this.boss.x, this.boss.y);
      this.bossDom.setVisible(!this.scene.isPaused());
    }
  }
}
