import { ActivatedRoute } from '@angular/router';
import { Component } from '@angular/core'
import { GameService } from '../services/game.service'
import { Router } from '@angular/router'
import { UserService } from '../services/user.service'
import { Subscription } from 'rxjs';

interface User {
  username: string;
  imageUrl: string;
  cx: number;
  cy: number;
  fill: string;
  isHost: boolean;
}

@Component({
  selector: 'app-room-page',
  templateUrl: './room-page.component.html',
  styleUrls: ['./room-page.component.scss']
})
export class RoomPageComponent {

  subscriptions: Subscription[] = []

  users: User[] = [];
  username: string = localStorage.getItem('username') ?? ''
  circleRadius = 21.5
  gameId: string = ''
  gameChoice: string = ''
  gameStarted = false
  gameData = ''
  animationDone = false
  joining: boolean = localStorage.getItem('joining') === 'true' ? true : false

  constructor(private gameService: GameService, private userService: UserService, private router: Router, private activatedRoute: ActivatedRoute) {
    this.subscriptions.push(
      this.activatedRoute.params.subscribe(params => {
        this.gameId = params['gameId']
      })
    )
    if (this.joining)
      this.gameService.joinGameSocketConnect(this.gameId, this.username, `https://api.multiavatar.com/${this.username}.png`)
    else
      this.gameService.hostGameSocketConnect(this.gameId, this.username, this.gameChoice)

    this.gameService.lobbyClosedEvent()

    this.subscriptions.push(
      this.gameService.playerJoinedEvent().subscribe((data: any) => {
        this.getGameData(this.gameId);
        setTimeout(() => {
          if (localStorage.getItem('username') !== data.username)
            console.log('player joined new users list: ', this.users)
        }, 2500)
      })
    )

    this.subscriptions.push(
      this.gameService.playerLeftEvent().subscribe((data: any) => {
        this.getGameData(this.gameId);
        setTimeout(() => {
          console.log('player left new users list: ', this.users)
        }, 2500)
      })
    )

    this.subscriptions.push(
      this.gameService.hostStartedEvent().subscribe((data: any) => {
        const { username, gameChoice, gameData } = data;
        console.log(`Host ${username} started the game with mode ${gameChoice} containing gameData: ${gameData}`);
        this.gameStarted = true;
        this.gameData = gameData
      })
    )

    // Attach the beforeunload event listener to handle disconnection on window close/refresh
    window.addEventListener('beforeunload', () => {
      this.gameService.disconnectBeforeUnload(this.username);
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.map((sub) => {
      sub.unsubscribe()
      sub.remove
      console.log(`Subscription successfully removed.`);
    })
  }

  // Used to request and store necessary data persistently
  ngOnInit(): void {
    // On init, refresh the perception of players in the lobby
    this.getGameData(this.gameId);
  }

  closeLobby(): void {
    this.subscriptions.push(
      this.userService.closeLobby(this.gameId).subscribe({
        next: (response) => {
          console.log(response)
          const { message } = response
          if (message === 'closeLobbySuccess') {
            this.gameService.closeLobbySocket(this.gameId, this.username)
            this.router.navigateByUrl('/home')

            localStorage.removeItem('joining')
          }
        },
        error: (err) => {
          console.log(err)
        }
      })
    )
  }

  leaveGame(): void {
    this.subscriptions.push(
      this.userService.leaveGame(this.gameId).subscribe({
        next: (response) => {
          console.log(response)
          const { message } = response
          if (message === 'leaveGameSuccess') {
            this.gameService.leaveGameSocket(this.gameId, this.username)
            this.router.navigateByUrl('/home')

            localStorage.removeItem('joining')
          }
        },
        error: (err) => {
          console.log(err)
        }
      })
    )
  }


  findUserByUsername(userList: User[], tempUsername: string) {
    for (let i = 0; i < userList.length; i++) {
      if (userList[i].username === tempUsername) {
        return userList[i];
      }
    }
    // If the username is not found, return null or handle it as needed.
    return null;
  }

  getGameData(gameId: string): void {
    this.subscriptions.push(
      this.userService.getGameData(gameId).subscribe({
        next: (response) => {
          const { message } = response
          if (message === 'getGameDataSuccess') {
            var tempUsers: User[] = this.users;
            this.users = []
            const usernames: string[] = response.data.players;
            const hostUsername: string = response.data.host;

            // Use the usernames to create User objects
            const gameUsers: User[] = usernames.map((username) => {
              const existingUser = this.findUserByUsername(tempUsers, username);

              return {
                username: username,
                imageUrl: `https://api.multiavatar.com/${username}.png`,
                cx: existingUser ? existingUser.cx : this.getRandomX(),
                cy: existingUser ? existingUser.cy : this.getRandomY(),
                fill: 'green',
                isHost: username === hostUsername,
              };
            });
            this.users.push(...gameUsers);
          }
        },
        error: (err) => {
          console.log(err)
        }
      })
    )
  }

  startGame(): void {
    console.log(this.gameId)
    this.userService.startGame(this.gameId).subscribe({
      next: (response) => {
        const { message } = response
        if (message === 'startGameSuccess') {
          this.animationDone = false
          this.gameService.startGameSocket(this.gameId, this.username)
          console.log(response)
        }
      },
      error: (err) => {
        console.log(err)
      }
    })
  }

  getRandomX(): number {
    const minX = 2 * this.circleRadius;
    const maxX = window.innerWidth - minX;
    return Math.random() * (maxX - minX) + minX;
  }

  getRandomY(): number {
    const minY = 2 * this.circleRadius;
    const maxY = (window.innerHeight * 0.7) - minY;
    return Math.random() * (maxY - minY) + minY;
  }

  handleAnimationDone(value: boolean) {
    this.animationDone = value
  }

}
