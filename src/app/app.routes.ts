import { Routes } from '@angular/router';
import { Register } from './pages/auth/register/register';
import { Home } from './pages/home/home';
import { Login } from './pages/auth/login/login';
import { Profile } from './pages/profile/profile';
import { Search } from './pages/search/search';
import { EditProfileComponent } from './pages/edit-profile/edit-profile';
import { Podcast } from './pages/podcast/podcast';
import { CreatePodcastComponent } from './pages/create-podcast/create-podcast'; // Import the new component

export const routes: Routes = [
    {path: "", component: Home},
    {path: "auth/register", component: Register},
    {path: "auth/login", component: Login},
    {path: "profile/edit", component: EditProfileComponent},
    {path: "profile/:id", component: Profile},
    {path: "profile", component: Profile},
    {path: "search/:term", component: Search},
    {path: "search", component:Search},
    {path: "podcast/:id", component:Podcast},
    {path: "create-podcast", component: CreatePodcastComponent} // Add the new route
];
