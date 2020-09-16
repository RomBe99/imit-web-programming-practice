package ru.omsu.imit.lab1;

import ru.omsu.imit.lab1.urlgetter.URLGetter;
import ru.omsu.imit.lab1.urlgetterimpl.SocketGetter;
import ru.omsu.imit.lab1.urlgetterimpl.URLConnectionGetter;

import java.net.MalformedURLException;
import java.net.URL;

public class Lab1Demo {
    public static void main(String[] args) throws MalformedURLException {
        final URL url = new URL("http://www.google.com/");
        final String fileName = "file.txt";

        URLGetter urlGetter = new SocketGetter(url);
        urlGetter.getData(fileName);
    }
}