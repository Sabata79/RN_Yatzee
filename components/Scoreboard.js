import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, ImageBackground } from 'react-native';
import { DataTable } from 'react-native-paper';
import styles from '../styles/styles';
import { NBR_OF_SCOREBOARD_ROWS } from '../constants/Game';
import { database } from '../components/Firebase';  // Import firebase configuration
import { ref, onValue, remove } from 'firebase/database';

export default function Scoreboard({ navigation }) {
  const [scores, setScores] = useState([]);
  const [latestScoreIndex, setLatestScoreIndex] = useState(null);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getScoreboardData();
    });
    return unsubscribe;
  }, [navigation]);

  const getScoreboardData = () => {
    const scoresRef = ref(database, 'scores');
    onValue(scoresRef, snapshot => {
      const data = snapshot.val();
      if (data) {
        const tmpScores = Object.values(data);
        const sortedScores = tmpScores.slice().sort((a, b) => b.points - a.points);
        setScores(sortedScores);

        if (sortedScores.length > 0) {
          const latestScore = sortedScores[0];
          const latestScoreIndex = tmpScores.findIndex(score => score.key === latestScore.key);
          setLatestScoreIndex(latestScoreIndex);
        }
      } else {
        setScores([]);
        setLatestScoreIndex(null);
      }
    });
  };

  const clearScoreboard = () => {
    const scoresRef = ref(database, 'scores');
    remove(scoresRef)
      .then(() => {
        setScores([]);
        setLatestScoreIndex(null);
      })
      .catch(error => {
        console.log('Error: ' + error);
      });
  };

  return (
    <ImageBackground
      source={require('../assets/diceBackground.jpg')}
      style={styles.background}>
      <View style={styles.overlay}>
        <ScrollView style={styles.container}>

          <Text style={styles.buttonText}>Scoreboard</Text>
          {scores.length === 0 ? (
            <Text style={styles.scoreboardText}>No scores yet</Text>
          ) : (
            <DataTable style={styles.scoreBoardHeader}>
              <DataTable.Header>
                <DataTable.Title style={styles.cell}>
                  <Text style={styles.scoreboardText}>Position #</Text>
                </DataTable.Title>
                <DataTable.Title style={styles.cell}>
                  <Text style={styles.scoreboardText}>Name</Text>
                </DataTable.Title>
                <DataTable.Title style={styles.cell}>
                  <Text style={styles.scoreboardText}>Date</Text>
                </DataTable.Title>
                <DataTable.Title style={styles.cell}>
                  <Text style={styles.scoreboardText}>Time</Text>
                </DataTable.Title>
                <DataTable.Title style={styles.cell}>
                  <Text style={styles.scoreboardText}>Points</Text>
                </DataTable.Title>
              </DataTable.Header>

              {scores.slice(0, NBR_OF_SCOREBOARD_ROWS).map((score, index) => (
                <DataTable.Row key={score.key}>
                  <DataTable.Cell style={styles.cell}>
                    <Text style={styles.scoreboardText}>{index + 1}.</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.cell}>
                    <Text style={styles.scoreboardText}>{score.name}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.cell}>
                    <Text style={styles.scoreboardText}>{score.date}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.cell}>
                    <Text style={styles.scoreboardText}>{score.time}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.cell}>
                    <Text style={styles.scoreboardText}>{score.points}</Text>
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          )}
          {scores.length > 0 && (
            <View style={styles.resetButton}>
              <Pressable
                style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
                onPress={() => clearScoreboard()}
              >
                <Text style={styles.resetButtonText}>Clear scoreboard</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </View>
    </ImageBackground>
  );
}
