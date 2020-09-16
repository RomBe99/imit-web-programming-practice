package ru.omsu.imit.lab1.urlgetterimpl;

import ru.omsu.imit.lab1.urlgetter.URLGetter;

import java.io.BufferedReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;
import java.net.URLConnection;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

public class URLConnectionGetter extends URLGetter {
    public URLConnectionGetter(URL url) {
        super(url);
    }

    @Override
    public void getData(String outputFileName) {
        try {
            URLConnection connection = getUrl().openConnection();

            final Map<String, List<String>> headerFields = connection.getHeaderFields();
            for (String field : headerFields.keySet()) {
                System.out.println(field + headerFields.get(field));
            }

            if (connection.getContentLength() < 0) {
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
                     FileWriter writer = new FileWriter(outputFileName, StandardCharsets.UTF_8)) {
                    String temp;

                    while(((temp = reader.readLine()) != null)) {
                        writer.write(temp);
                    }
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}