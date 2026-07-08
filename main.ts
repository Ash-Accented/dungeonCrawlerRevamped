namespace SpriteKind {
    export const Title = SpriteKind.create()
}

function showTitleScreen() {
    let TitleScreen = sprites.create(assets.image`Title`, SpriteKind.Title)
    game.showLongText("THE FORGOTTEN CRYPT", DialogLayout.Bottom)
    showStoryScreen()

}

//music.play(assets.melody`Opening`, music.PlaybackMode.UntilDone)

function showStoryScreen() {

    let New = sprites.create(assets.image`Amulet`, SpriteKind.Title)
    game.showLongText("Centuries of silence are broken. You step into the damp, dark halls to reclaim the Lost Amulet. Beware the shadows...", DialogLayout.Bottom)
    // Your specific instructions
    let Con = sprites.create(assets.image`Controller`, SpriteKind.Title)
    game.showLongText("Instructions: Use the gyro to move. Use A to hit, and Switch to switch weapons.", DialogLayout.Bottom)
    let Screen = sprites.create(assets.image`Door`, SpriteKind.Title)
    game.showLongText("Find the exit before you die!", DialogLayout.Bottom)
    // Transition to gameplay
    sprites.destroyAllSpritesOfKind(SpriteKind.Title)
}

// Start the sequence

showTitleScreen()



const turnSpeed = 0.08;
const moveSpeed = 20;
enum EnemyKind {
    Slime,
    Turret,
    Dead,
}
enum WeaponHeld {
    BowAndArrow,
    Sword,
}

let viewAngle = 0;


tiles.setCurrentTilemap(tilemap`level2`);
scene.setBackgroundImage(assets.image`background`);

class Animations {
    static slimeAnimation(slimeEnemy: Sprite) {
        let msDelay = 200
        animation.runImageAnimation(slimeEnemy, assets.animation`SlimeJump`, msDelay, true);
    }
    static slimeAnimationDeath(slimeEnemy: Sprite) {
        let msDelay = 100
        animation.runImageAnimation(slimeEnemy, assets.animation`SlimeDie`, msDelay, false);
        slimeEnemy.data["kind"] = EnemyKind.Dead;
        timer.after(1000, function () {
            sprites.destroy(slimeEnemy);
        })
    }
    static swordAnimation(hand: Sprite) {
        let msDelay = 200
        animation.runImageAnimation(hand, assets.animation`SwordPull`, msDelay, false)
    }
    static swordAnimationSlash(hand: Sprite) {
        let msDelay = 100
        animation.runImageAnimation(hand, assets.animation`SwordSwing`, msDelay, false)
        timer.after(500, function () {
            Animations.swordAnimation(player.hand);
        })
    }

    static turretAnimationShoot(turret: Sprite) {
        let msDelay = 200
        animation.runImageAnimation(turret, assets.animation`TurretShoot`, msDelay, false)
    }
    static turretAnimationShootBullet(projectile: Sprite) {
        let msDelay = 200
        animation.runImageAnimation(projectile, assets.animation`turretShootProjectile`, msDelay, true)
    }

}

class GameUtils {
    static radToDegConv = 180 / Math.PI; //Since the built in function for the pxt-raycasting extension [Render.viewAngleInDegrees()] requires an argument in degrees

    static getRandomVelocity(min: number, max: number) {
        return Math.random() * (max - min) + min;
    }

    //Control angular rotation of player and changes the player vx/vy values accordingly
    static angleManagement() {
        if (controller.left.isPressed()) viewAngle -= turnSpeed;
        if (controller.right.isPressed()) viewAngle += turnSpeed;
        let viewAngleDegrees = viewAngle * GameUtils.radToDegConv;
        Render.setViewAngleInDegree(viewAngleDegrees);


        let moveDir = 0;
        if (controller.up.isPressed()) moveDir = 1;
        if (controller.down.isPressed()) moveDir = -1;

        if (moveDir != 0) {
            player.sprite.vx = Math.cos(viewAngle) * moveSpeed * moveDir;
            player.sprite.vy = Math.sin(viewAngle) * moveSpeed * moveDir;
        }
        else {
            player.sprite.vx = 0;
            player.sprite.vy = 0;
        }

    }
    //Get the angle between two coordinate points
    static getAngle(xOne: number, yOne: number, xTwo: number, yTwo: number) {
        return Math.atan2(yTwo - yOne, xTwo - xOne);
    }
    //Get the distance between two coordinate points
    static getDistance(xOne: number, yOne: number, xTwo: number, yTwo: number) {
        let dx = xTwo - xOne; //Difference in x values
        let dy = yTwo - yOne; //Difference in y values
        return Math.sqrt(dx * dx + dy * dy); //Pythagorean Theroem to calculate for the distance between two coordinats
    }
}

class BowAndArrow {
    sprite: Sprite

    constructor() {
        this.sprite = sprites.create(assets.image`bowAndArrow`, SpriteKind.Food);;
    }

    
}

class Sword {
    sprite: Sprite

    constructor() {
        this.sprite = sprites.create(assets.image`swordHeld`, SpriteKind.Food);
    }


    static checkSwordSlash() {
        if (player.handHeldId != WeaponHeld.Sword) return;
        if (controller.A.isPressed()) {
            Animations.swordAnimationSlash(player.hand);
            let enemyArray = sprites.allOfKind(SpriteKind.Enemy);
            for (let enemy of enemyArray) {
                let distance = GameUtils.getDistance(enemy.x, enemy.y, player.sprite.x, player.sprite.y);
                if (distance <= 12 && player.sprite.overlapsWith(enemy) == false && enemy.data["kind"] == EnemyKind.Slime) {
                    //Render.setSpriteAttribute(enemy, RCSpriteAttribute.ZOffset, 0)
                    Animations.slimeAnimationDeath(enemy);
                }
            }
        }
    }
}



class Player {
    sprite: Sprite;
    hand: Sprite;
    handHeldId: WeaponHeld;
    constructor() {
        let player: Sprite = Render.getRenderSpriteInstance();
        info.setLife(3)
        tiles.placeOnRandomTile(player, assets.tile`baseTransparency16`)
        this.sprite = player;
        this.hand = sprites.create(assets.image`swordHeld`, SpriteKind.Food)
        this.hand.setScale(4, ScaleAnchor.Middle)
        this.hand.setFlag(SpriteFlag.RelativeToCamera, true)
        this.handHeldId = WeaponHeld.Sword;
        this.hand.x = 130
        this.hand.y = 95
    }

    static handBobbing() {
        if (controller.dx() != 0) {
            player.hand.y = 95 + Math.sin(game.runtime() / 100) * 3
        }
        else {
            player.hand.y = 95
        }
    }

    static checkWeaponChange() {
        browserEvents.O.onEvent(browserEvents.KeyEvent.Pressed, function () {
            if (player.handHeldId == WeaponHeld.Sword) {
                player.handHeldId = WeaponHeld.BowAndArrow
            }
            else {
                player.handHeldId = WeaponHeld.Sword
            }
        })
        Player.checkHeld();
        
    }

    static checkHeld() {
        if (player.handHeldId == WeaponHeld.Sword) {
            sprites.destroy(player.hand)
            player.hand = sword.sprite;

        }
        else if (player.handHeldId == WeaponHeld.BowAndArrow) {
            sprites.destroy(player.hand)
            player.hand = bowAndArrow.sprite;
        }
        player.hand.setScale(4, ScaleAnchor.Middle)
        player.hand.setFlag(SpriteFlag.RelativeToCamera, true)
        player.hand.x = 130
        player.hand.y = 95
    }

    static checkCollision() {
        let projectileArray = sprites.allOfKind(SpriteKind.Projectile);
        let enemyArray = sprites.allOfKind(SpriteKind.Enemy);
        for (let enemy of enemyArray) {
            let distance = GameUtils.getDistance(enemy.x, enemy.y, player.sprite.x, player.sprite.y)
            if (distance <= 3) {

                timer.throttle("enemyDamage", 1000, function () {
                    info.changeLifeBy(-1);
                    scene.cameraShake(40, 200);
                })

            }
        }
        for (let projectile of projectileArray) {
            let distance = GameUtils.getDistance(projectile.x, projectile.y, player.sprite.x, player.sprite.y)
            console.log("PROJECTILE DISTANCE: " + distance);
            if (distance <= 4.5) {
                projectile.vx = 0;
                projectile.vy = 0;
                console.log("DAMAGE TAKEN");
                timer.throttle("projectileDamage", 1000, function () {
                    info.changeLifeBy(-1);
                    scene.cameraShake(40, 200);
                    sprites.destroy(projectile);
                })


            }

        }
    }



}



class Slime {
    sprite: Sprite;
    randomVx: number;
    randomVy: number;
    constructor() {
        let slimeEnemy: Sprite = null;
        slimeEnemy = sprites.create(assets.image`slime0`, SpriteKind.Enemy)
        Render.takeoverSceneSprites()
        tiles.placeOnRandomTile(slimeEnemy, assets.tile`baseTransparency16`)
        slimeEnemy.setBounceOnWall(true)
        slimeEnemy.setScale(0.5, ScaleAnchor.Middle)
        slimeEnemy.vx = 0
        slimeEnemy.vy = 0
        slimeEnemy.data["kind"] = EnemyKind.Slime;
        slimeEnemy.data["rVx"] = GameUtils.getRandomVelocity(-10, 10);
        slimeEnemy.data["rVy"] = GameUtils.getRandomVelocity(-10, 10);
        this.sprite = slimeEnemy;


        Animations.slimeAnimation(slimeEnemy);
    }


    static controlSlimeEnemyAi(slimeEnemy: Sprite) {
        if (slimeEnemy.data["kind"] != EnemyKind.Slime) return;
        let maxDistance = 75;
        let speedFactor = 20;
        let angle = GameUtils.getAngle(slimeEnemy.x, slimeEnemy.y, player.sprite.x, player.sprite.y)
        let distance = GameUtils.getDistance(slimeEnemy.x, slimeEnemy.y, player.sprite.x, player.sprite.y);
        console.log(distance);
        if (distance <= maxDistance) {
            slimeEnemy.vx = Math.cos(angle) * speedFactor;
            slimeEnemy.vy = Math.sin(angle) * speedFactor;
        }
        else {
            slimeEnemy.vx = slimeEnemy.data["rVx"];
            slimeEnemy.vy = slimeEnemy.data["rVy"];
        }
        scene.onHitWall(SpriteKind.Enemy, function (sprite: Sprite, location: tiles.Location) {
            slimeEnemy.vx = -1 * slimeEnemy.data["rVx"];
            slimeEnemy.vy = slimeEnemy.data["rVy"];
        })



        Render.jumpWithHeightAndDuration(slimeEnemy, 4, 900)
    }
    static spawnSlimes(amount: number) {
        for (let i = 0; i < amount; i++) {
            let slime = new Slime();
        }
    }
}


class Turret {
    sprite: Sprite;
    constructor() {
        let turretEnemy: Sprite = null;
        turretEnemy = sprites.create(assets.image`turret0`, SpriteKind.Enemy)
        Render.takeoverSceneSprites()
        tiles.placeOnRandomTile(turretEnemy, assets.tile`baseTransparency16`)
        turretEnemy.setScale(0.5, ScaleAnchor.Middle)
        turretEnemy.vx = 0;
        turretEnemy.vy = 0;
        turretEnemy.data["kind"] = EnemyKind.Turret;
        this.sprite = turretEnemy;



    }


    static controlTurretEnemyAi(turretEnemy: Sprite) {
        if (turretEnemy.data["kind"] != EnemyKind.Turret) return;
        let maxDistance = 75;
        let speedFactor = 25;
        let angle = GameUtils.getAngle(turretEnemy.x, turretEnemy.y, player.sprite.x, player.sprite.y)
        let distance = GameUtils.getDistance(turretEnemy.x, turretEnemy.y, player.sprite.x, player.sprite.y);
        let vxSpeedProj = Math.cos(angle) * speedFactor;
        let vySpeedProj = Math.sin(angle) * speedFactor;
        console.log(distance);
        if (distance <= maxDistance) {

            timer.throttle("createProjectile", 3000, function () {
                let projectile = sprites.createProjectileFromSprite(assets.image`baseProjectile`, turretEnemy, vxSpeedProj, vySpeedProj);
                projectile.setScale(0.5, ScaleAnchor.Middle);
                Animations.turretAnimationShoot(turretEnemy);
                Animations.turretAnimationShootBullet(projectile);

            })
        }


    }
    static spawnTurrets(amount: number) {
        for (let i = 0; i < amount; i++) {
            let turret = new Turret();
        }
    }
}










let player = new Player();
let sword = new Sword();
let bowAndArrow = new BowAndArrow();
//Render.setAttribute(Render.attribute.fov, 90);
Slime.spawnSlimes(3);
Turret.spawnTurrets(2);

let enemyArray = sprites.allOfKind(SpriteKind.Enemy);
let turretArray = enemyArray.filter(sprite => sprite.data["kind"] == EnemyKind.Turret);
let slimeArray = enemyArray.filter(sprite => sprite.data["kind"] == EnemyKind.Slime);

//LEVEL 2
function checkLevelClear() {

    let winTiles: tiles.Location[] = tiles.getTilesByType(assets.tile`collectibleInsignia`);

    for (let winTile of winTiles) {
        if (player.sprite.tilemapLocation() == winTile) {

        }
    }
}
let currentLevel = 1;



function startLevel() {
    for (let enemy of sprites.allOfKind(SpriteKind.Enemy)) {
        sprites.destroy(enemy);
    }
    for (let proj of sprites.allOfKind(SpriteKind.Projectile)) {
        sprites.destroy(proj);
    }

    let slimeEnemies = [];
    let turretEnemies = [];

    tiles.setCurrentTilemap(assets.tilemap`level2`);
    if (currentLevel == 2) {
        game.splash("The walls are closing in...");

        for (let col = 4; col < 12; col += 2) {
            for (let row = 4; row < 12; row += 2) {

                tiles.setTileAt(tiles.getTileLocation(col, row), sprites.dungeon.purpleOuterWest0);
                tiles.setWallAt(tiles.getTileLocation(col, row), true);
            }
        }
    }


    if (player == null) {
        player = new Player();
    } else {
        tiles.placeOnRandomTile(player.sprite, assets.tile`baseTransparency16`);
    }

    let slimeCount = 1 + currentLevel;
    let turretCount = currentLevel;

    for (let i = 0; i < slimeCount; i++) {
        slimeEnemies.push(new Slime());
    }

    for (let i = 0; i < turretCount; i++) {
        turretEnemies.push(new Turret());
    }

    game.splash("Level " + currentLevel);
}


//Render.setViewMode(ViewMode.tilemapView)


game.onUpdate(function () {
    GameUtils.angleManagement();
    Player.handBobbing();
    for (let turret of turretArray) {
        Turret.controlTurretEnemyAi(turret);
    }

    for (let slime of slimeArray) {
        Slime.controlSlimeEnemyAi(slime);
    }
    Player.checkWeaponChange();
    Sword.checkSwordSlash();
    Player.checkCollision();
    checkLevelClear();
})