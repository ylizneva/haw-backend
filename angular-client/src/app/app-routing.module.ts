import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GamesComponent } from './games/games.component';
import { HomeComponent } from './home/home.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { LaunchPageComponent } from './launch-page/launch-page.component';
import { RegisterPageComponent } from './register-page/register-page.component';
import { RoomPageComponent } from './room-page/room-page.component';
// import { AuthGuard } from './auth.guard';
import { AnimatedGameTextComponent } from './animated-game-text/animated-game-text.component';

const routes: Routes = [
  { path: '', component: LaunchPageComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegisterPageComponent },
  { path: 'home', component: HomeComponent },
  { path: 'games', component: GamesComponent },
  { path: 'room/:gameId', component: RoomPageComponent },
  //{ path: 'room', component: RoomPageComponent },

  // { path: 'home', redirectTo: '', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'anime', component: AnimatedGameTextComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
