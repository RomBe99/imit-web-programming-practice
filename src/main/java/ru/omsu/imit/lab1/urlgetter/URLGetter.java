package ru.omsu.imit.lab1.urlgetter;

import java.net.URL;

public abstract class URLGetter {
    private URL url;

    public URLGetter(URL url) {
        this.url = url;
    }

    public void setUrl(URL url) {
        this.url = url;
    }

    public URL getUrl() {
        return url;
    }

    public abstract void getData(String fileOutputName);
}