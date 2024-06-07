import { Injectable } from "@angular/core";

@Injectable()
export class ScreenService {
    public width: number = 0;
    public height: number = 0;
    
    private widthUpdateCallback: any;

    public set(width: number, height: number) {
        this.width = width;
        this.height = height;
    }
}