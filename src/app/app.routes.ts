import { Routes } from '@angular/router';
import { Register } from './pages/auth/register/register';
import { Home } from './pages/home/home';
import { Login } from './pages/auth/login/login';
import { Profile } from './pages/profile/profile';
import { Search } from './pages/search/search';

export const routes: Routes = [
    {path: "", component: Home},
    {path: "auth/register", component: Register},
    {path: "auth/login", component: Login},
    {path: "profile/:id", component: Profile},
    {path: "profile", component: Profile},
    {path: "search/:term", component: Search},
    {path: "search", component:Search}
];
