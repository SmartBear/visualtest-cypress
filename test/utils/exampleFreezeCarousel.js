//for these sites:
//https://smartbear.github.io/visual-testing-example-website/Example4/Original/index.html
if (typeof jQuery == 'function'){
    if (typeof jQuery('.carousel').carousel == 'function'){
        jQuery('.carousel').carousel(0);
        jQuery('.carousel').carousel('pause');
    }
    if (typeof jQuery('.owl-carousel').trigger == 'function'){
        jQuery('.owl-carousel').trigger('stop.owl.autoplay');
        jQuery('.owl-carousel').trigger('to.owl.carousel',[0]);
    }
}
if (typeof slider == 'object'){
    slider.goTo(0);
    slider.pause();
}
if (typeof slider1 == 'object'){
    slider1.goTo(0);
    slider1.pause();
}
if (typeof slider2 == 'object'){
    slider2.goTo(0);
    slider2.pause();
}