package ru.omsu.imit.lab1.urlgetterimpl;

import ru.omsu.imit.lab1.urlgetter.URLGetter;

import java.io.*;
import java.net.Socket;
import java.net.URL;
import java.nio.charset.StandardCharsets;

public class SocketGetter extends URLGetter {
    private int port = 80;

    public SocketGetter(int port, URL url) {
        super(url);

        this.port = port;
    }

    public SocketGetter(URL url) {
        super(url);
    }

    public String generateGETRequest() {
        return "GET " + getUrl().getPath() + " HTTP/1.1\n" +
                "Host: " + getUrl().getHost() + "\n\n";
    }

    public void setPort(int port) {
        this.port = port;
    }

    public int getPort() {
        return port;
    }

    @Override
    public void getData(String outputFileName) {
        try (Socket socket = new Socket(getUrl().getHost(), port);
             PrintWriter writer = new PrintWriter(socket.getOutputStream(), true);
             BufferedReader reader = new BufferedReader(new InputStreamReader(socket.getInputStream()))) {
            String requestTitles = generateGETRequest();
            writer.println(requestTitles);

            String temp;

            while ((temp = reader.readLine()) != null && !temp.isEmpty()) {
                System.out.println(temp);
            }

            try (FileWriter fileWriter = new FileWriter(outputFileName, StandardCharsets.UTF_8)) {
                while ((temp = reader.readLine()) != null) {
                    fileWriter.write(temp);
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}